import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from 'src/users/dto/user.dto';
import { RegisterDto } from 'src/users/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/users/dto/login.dto';
import { Response } from 'express';
import { retry } from 'rxjs';
import { access } from 'fs/promises';

// AuthService nhận vào RegisterDTO và trả về UserDTO
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(private prisma: PrismaService,
        private jwtService: JwtService) { }

    // Hàm đăng ký tài khoản
    async register(registerDto: RegisterDto) {
        const { username, password, email, phone } = registerDto;

        // kiểm tra email duy nhất
        const userExit = await this.prisma.user.findUnique({ where: { email } });
        if (userExit) {
            throw new BadRequestException('Tài khoản đã tồn tại trong hệ thống');
        }

        // mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu thông tin tài khoản
        try {
            const user = await this.prisma.user.create({ data: { username, email, phone, password: hashedPassword } });
            return { message: 'Đăng ký tài khoản thành công', data: new UserDto(user) }
        } catch (error) {
            this.logger.error('Đăng ký thất bại: ', error);
        }
    }

    // Đăng nhập
    async login(loginDto: LoginDto, res: Response) {
        const { email, password } = loginDto;

        const userAccount = await this.prisma.user.findUnique({ where: { email } });
        if (!userAccount) {
            throw new BadRequestException('Email hoặc mật khẩu không chính xác');
        }

        const isMatch = await bcrypt.compare(password, userAccount.password);
        if (!isMatch) {
            throw new BadRequestException('Email hoặc mật khẩu không chính xác');
        }

        const payload = { sub: userAccount.id, email: userAccount.email, role: userAccount.role };

        const accessToken = await this.jwtService.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' });

        const refreshToken = await this.jwtService.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({ where: { id: userAccount.id }, data: { refreshToken: hashedRefreshToken } });

        res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return { message: 'Đăng nhập thành công', accessToken, userAccount: new UserDto(userAccount) }
    }

    // Refresh token
    async refesh(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('Không tìm thấy refresh token');
        }

        let payload: any;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
        } catch {
            throw new UnauthorizedException('Refesh token không hợp lệ');
        }

        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Refresh token không tồn tại');
        }

        const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValid) {
            throw new UnauthorizedException('Refresh token không hợp lệ');
        }

        const newAccessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role },
            {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '15m'
            }
        );

        return { accessToken: newAccessToken }
    }

    // Đăng xuất
    async logout(userId: string, res: Response) {
        await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });

        res.clearCookie('refresh_token');

        return { message: 'Đăng xuất thành công' };
    }

}
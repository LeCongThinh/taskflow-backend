import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from 'src/users/dto/user.dto';
import { RegisterDto } from 'src/users/dto/register.dto';
import * as bcrypt from 'bcrypt';

// AuthService nhận vào RegisterDTO và trả về UserDTO
@Injectable()
// export class AuthService {
//     constructor(private prisma: PrismaService) { }
//     async register(registerDto: RegisterDto) {
//         const { username, password, email, phone } = registerDto;
//         const userExist = await this.prisma.user.findUnique({ where: { email } });
//         if (userExist) {
//             throw new BadRequestException('Email đã tồn tại trong hệ thống');
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = await this.prisma.user.create({ data: { username, password: hashedPassword, phone, email } });
//         return { message: 'Đăng ký tài khoản thành công', data: new UserDto(user) };
//     }
// }
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(private prisma: PrismaService) { }
    async register(registerDto: RegisterDto) {
        const { username, password, phone, email } = registerDto;
        const userExist = await this.prisma.user.findUnique({ where: { email } });
        if (userExist) {
            throw new BadRequestException('Email đã tồn tại trong hệ thống');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await this.prisma.user.create({ data: { username, password: hashedPassword, email, phone } });
            return { message: 'Đăng ký tài khoản thành công', data: new UserDto(user) };
        } catch (error) {
            this.logger.error('Đăng ký tài khoản thất bại: ', error);
        }
    }
}
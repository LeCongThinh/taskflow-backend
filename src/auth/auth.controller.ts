import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from 'src/users/dto/register.dto';
import { LoginDto } from 'src/users/dto/login.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // Endpoint đăng ký
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    // Endpoint đăng nhập
    @Post('login')
    login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(loginDto, res);
    }

    // Endpoint refresh token
    @Post('refresh')
    refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        return this.authService.refesh(refreshToken);
    }

    // Endpoint đăng xuẩt
    @Post('logout')
    logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            throw new UnauthorizedException('Chưa đăng nhập');
        }
        // Tạm thời decode trong service refresh sẽ chuẩn hơn.
        // Sau này nên dùng JwtAuthGuard để lấy userId từ access token.
        throw new UnauthorizedException(
            'Logout nên làm sau khi có JwtAuthGuard để lấy userId',
        );
    }
}
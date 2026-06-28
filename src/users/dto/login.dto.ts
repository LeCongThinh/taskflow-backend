import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: 'Vui lòng nhập email đăng nhập' })
    @IsEmail({}, { message: 'Email đăng nhập không hợp lệ' })
    email: string;

    @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
    password: string;
}
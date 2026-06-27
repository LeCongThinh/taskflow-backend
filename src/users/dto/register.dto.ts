import { IsEmail, isString, isNotEmpty, Length, Matches, IsNotEmpty, IsString } from "class-validator";
export class RegisterDto {
    @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
    @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
    username: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    // Dùng regex để kiểm tra email có đuôi @gmail.com
    @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, { message: 'Email bắt buộc phải có đuôi @gmail.com' })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @Length(8, 50, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    password: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    // Dùng regex để ktra số điện thoại đúng 10 số
    @Matches(/^\d{10}$/, { message: 'Số điện thoại phải có đúng 10 chữ số' })
    phone: string;
}
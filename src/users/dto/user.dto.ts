// Class UserDto định hình dữ liệu đầu ra
import { Exclude } from "class-transformer";
export class UserDto {
    id: string;
    username: string;
    email: string;
    phone: string;
    avatar: string | null;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    createAt: Date;
    updateAt: Date;

    // Đánh dấu: Cột này sẽ tự động bị XOÁ bỏ khi đi qua classSerializer
    @Exclude()
    password: string;

    constructor(partial: Partial<UserDto>) {
        // Hàm này giúp map dữ liệu từ Prisma Object sang Class DTO nhanh chóng
        Object.assign(this, partial);
    }
}
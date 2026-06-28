// validate toàn cục
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Đọc cookie từ request
  app.use(cookieParser());

  // Cho phép frontend gửi cookie kèm request
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });

  // kích hoạt validate trên toàn bộ hệ thống
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Chuẩn hóa dữ liệu đầu ra. Ẩn các thông tin không cần thiết
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Đường dẫn trang chủ: http://localhost:${port}`);
}
bootstrap();
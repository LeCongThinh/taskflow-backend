// validate toàn cục
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // kích hoạt validate trên toàn bộ hệ thống
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Đường dẫn trang chủ: http://localhost:${port}`);
}
bootstrap();

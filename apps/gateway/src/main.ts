import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger, ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.setGlobalPrefix('api/auth-service');
  await app.listen(process.env.port ?? 5000);
  Logger.debug(
    `🚀 start gateway is running on ${process.env.PORT}`,
  );
}
bootstrap();

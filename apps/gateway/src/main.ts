import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from 'libs/common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: [process.env.URL_BACKEND, process.env.URL_FRONTEND, 'https://crm-ai-gent.vercel.app', 'http://192.168.142.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  await app.listen(process.env.port ?? 5000);
  Logger.debug(`🚀 start gateway is running on ${process.env.PORT}`);
}
bootstrap();

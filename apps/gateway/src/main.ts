import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from 'libs/common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KafkaConstants } from '@app/kafka/kafka.constants';

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
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'gateway-kafka-client',
        brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
      },
      consumer: {
        groupId: KafkaConstants.ConsumerGroups.Gateway,
        allowAutoTopicCreation: true,
      },
    },
  });
  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 5000);
  Logger.debug(`🚀 Gateway (HTTP) running on ${process.env.PORT}`);
  Logger.debug(`🚀 Gateway (Kafka consumer) running`);

}
bootstrap();

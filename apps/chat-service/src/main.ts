import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { KafkaConstants } from '@app/kafka/kafka.constants';

export const grpcUrlFanPage = '0.0.0.0:50052';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ===== gRPC microservice (giữ nguyên cấu hình cũ) =====
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['CHAT_PACKAGE'],
      protoPath: [
        join(process.cwd(), 'libs/proto/src/conversation.proto'),
        join(process.cwd(), 'libs/proto/src/messages.proto'),
        join(process.cwd(), 'libs/proto/src/label.proto'),
      ],
      url: grpcUrlFanPage,
      loader: {
        keepCase: true,
        longs: Number,
      },
    },
  });

  // ===== Kafka microservice (thêm mới) =====
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       clientId: KafkaConstants.ClientId,
  //       brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  //     },
  //     consumer: {
  //       groupId: KafkaConstants.ConsumerGroups.Default,
  //       allowAutoTopicCreation: true,
  //       sessionTimeout: 60000,
  //       heartbeatInterval: 3000,
  //       rebalanceTimeout: 60000,
  //     },
  //   },
  // });

  app.enableShutdownHooks();
  await app.startAllMicroservices(); // start cả gRPC lẫn Kafka cùng lúc

  Logger.debug(`🚀 Chat Service (gRPC) running on: ${grpcUrlFanPage}`);
  // Logger.debug(`🚀 Chat Service (Kafka) consumer group: chat-service-group`);
}
bootstrap();
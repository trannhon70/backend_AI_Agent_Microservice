import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
// import { KafkaConstants } from '@app/kafka/kafka.constants';
export const grpcUrlFanPage = '0.0.0.0:50053';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'FANPAGE_PACKAGE',
      protoPath: [
        join(process.cwd(), 'libs/proto/src/user_page.proto'),
        join(process.cwd(), 'libs/proto/src/fanpage.proto'),
        join(process.cwd(), 'libs/proto/src/telegram.proto'),
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
  Logger.debug(`🚀 Fanpage Service (gRPC) running on: ${grpcUrlFanPage}`);
  // Logger.debug(`🚀 Fanpage Service (Kafka) consumer group: Fanpage-service-group`);
}
bootstrap();

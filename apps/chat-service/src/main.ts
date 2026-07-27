import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
export const grpcUrlFanPage = '0.0.0.0:50052';
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule,
    {
      name: 'CHAT_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: ['CHAT_PACKAGE'],
        protoPath: [
          join(process.cwd(), 'libs/proto/src/conversation.proto'),
        ],
        url: grpcUrlFanPage,
        loader: {
          keepCase: true,
          longs: Number,
        },
      },
    },

  );

  app.enableShutdownHooks();
  await app.listen();
  Logger.debug(`🚀 Chat Service (gRPC) running on: ${grpcUrlFanPage}`);
}
bootstrap();

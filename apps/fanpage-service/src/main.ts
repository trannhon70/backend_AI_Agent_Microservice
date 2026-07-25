import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
export const grpcUrlFanPage = '0.0.0.0:50053';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule,
    {
      name: 'FANPAGE_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'FANPAGE_PACKAGE',
        protoPath: [
          join(process.cwd(), 'libs/proto/src/user_page.proto'),
          join(process.cwd(), 'libs/proto/src/fanpage.proto'),
        ],
        url: grpcUrlFanPage,
        loader: {
          keepCase: true,
          longs: Number,
        },
      },
    }
  );

  app.enableShutdownHooks();
  await app.listen();
  Logger.debug(`🚀 Fanpage Service (gRPC) running on: ${grpcUrlFanPage}`);
}
bootstrap();

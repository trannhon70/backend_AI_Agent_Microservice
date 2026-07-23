import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
async function bootstrap() {
  const grpcUrl = '0.0.0.0:50053';
  const app = await NestFactory.createMicroservice(AppModule,
    {
      name: 'FANPAGE_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'FANPAGE_PACKAGE',
        protoPath: [
          join(process.cwd(), 'libs/proto/src/user_page.proto'),
        ],
        url: grpcUrl,
        loader: {
          keepCase: true,
          longs: Number,
        },
      },
    }
  );

  app.enableShutdownHooks();
  await app.listen();
  Logger.debug(`🚀 Fanpage Service (gRPC) running on: ${grpcUrl}`);
}
bootstrap();

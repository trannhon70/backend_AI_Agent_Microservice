import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthServiceModule } from './auth-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const grpcUrl = '0.0.0.0:50051';
  const app = await NestFactory.createMicroservice(
    AuthServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(process.cwd(), 'libs/proto/src/auth.proto',),
        url: grpcUrl,
        loader: {
          keepCase: true,
        }
      },
    },
  );
  Logger.debug(`🚀 start Auth Service (gRPC) is running on: ${grpcUrl}`);
  await app.listen();

}

bootstrap();
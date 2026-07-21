import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GrpcClientModule } from 'libs/grpc-clients/src/grpc-client.module';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GrpcClientModule.forFeature({
      name: 'auth',
      package: 'auth',
      protoFile: 'auth.proto',
      urlEnvKey: 'AUTH_GRPC_URL',
    }),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule { }

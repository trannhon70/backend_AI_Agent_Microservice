import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database/typeorm.module';
import { GrpcClientModule } from 'libs/grpc-clients/src/grpc-client.module';
import { RedisModule } from 'libs/redis/redis.module';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GrpcClientModule.forFeature({
      name: 'auth',
      package: 'auth',
      protoFile: 'auth.proto',
      urlEnvKey: 'AUTH_GRPC_URL',
    }),
    DatabaseModule,
    RedisModule,
    RolesModule

  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule { }

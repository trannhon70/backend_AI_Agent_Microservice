import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'auth', // ⬅️ phải trùng chính xác với @Inject('auth')
        transport: Transport.GRPC,
        options: {
          package: 'auth', // ⬅️ trùng với package trong file .proto
          protoPath: join(__dirname, '../../../libs/proto/src/auth.proto'),
          url: '0.0.0.0:50051', // ⬅️ địa chỉ service gRPC đích (service nào bạn đang gọi tới)
        },
      },
    ]),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule { }

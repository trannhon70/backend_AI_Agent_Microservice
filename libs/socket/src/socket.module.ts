// socket.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'libs/redis/redis.module'; // 👈 thêm
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
  imports: [
    ConfigModule,
    RedisModule, // 👈 thêm — cần RedisService để subscribe
  ],
  providers: [SocketService, SocketGateway],
  exports: [SocketService, SocketGateway],
})
export class SocketModule { }
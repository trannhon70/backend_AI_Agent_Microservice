import { DatabaseModule } from '@app/database/typeorm.module';
import { KafkaModule } from '@app/kafka';
import { SocketModule } from '@app/socket';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtCommonModule } from 'libs/common/jwt/jwt-common.module';
import { GrpcClientModule } from 'libs/grpc-clients/src/grpc-client.module';
import { RedisModule } from 'libs/redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FanPageModule } from './fanpage/fanpage.module';
import { UserPageModule } from './user_page/user_page.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtCommonModule,
    SocketModule,
    GrpcClientModule.forFeature({
      name: 'FANPAGE_PACKAGE',
      package: 'FANPAGE_PACKAGE',
      protoFile: 'user_page.proto',
      urlEnvKey: 'FANPAGE_GRPC_URL',
    }),
    KafkaModule,
    DatabaseModule,
    RedisModule,
    UserPageModule,
    FanPageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

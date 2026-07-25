import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtCommonModule } from 'libs/common/jwt/jwt-common.module';
import { GrpcClientModule } from 'libs/grpc-clients/src/grpc-client.module';
import { DatabaseModule } from '@app/database/typeorm.module';
import { RedisModule } from 'libs/redis/redis.module';
import { UserPageModule } from './user_page/user_page.module';
import { FanPageModule } from './fanpage/fanpage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtCommonModule,
    GrpcClientModule.forFeature({
      name: 'FANPAGE_PACKAGE',
      package: 'FANPAGE_PACKAGE',
      protoFile: 'user_page.proto',
      urlEnvKey: 'FANPAGE_GRPC_URL',
    }),
    DatabaseModule,
    RedisModule,
    UserPageModule,
    FanPageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

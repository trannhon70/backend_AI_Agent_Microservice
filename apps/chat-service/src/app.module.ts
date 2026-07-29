import { DatabaseModule } from '@app/database/typeorm.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtCommonModule } from 'libs/common/jwt/jwt-common.module';
import { GrpcClientModule } from 'libs/grpc-clients/src/grpc-client.module';
import { RedisModule } from 'libs/redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationModule } from './conversation/conversation.module';
import { MessagesModule } from './messages/messages.module';
import { SocketModule } from '@app/socket';
import { LabelModule } from './label/label.module';
// import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    // EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtCommonModule,
    GrpcClientModule.forFeature({
      name: 'CHAT_PACKAGE',
      package: 'CHAT_PACKAGE',
      protoFile: 'conversation.proto',
      urlEnvKey: 'CHAT_GRPC_URL',
    }),
    SocketModule,
    DatabaseModule,
    RedisModule,
    ConversationModule,
    MessagesModule,
    LabelModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

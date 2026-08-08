import { DatabaseModule } from '@app/database/typeorm.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtCommonModule } from 'libs/common/jwt/jwt-common.module';
import { GrpcClientModule } from 'libs/grpc-clients/src/grpc-client.module';
import { RedisModule } from 'libs/redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationModule } from './conversation/conversation.module';
import { LabelModule } from './label/label.module';
import { MessagesModule } from './messages/messages.module';
import { QuickReplyModule } from './quick_reply/quick_reply.module';
import { QuickReplyCategoriesModule } from './quick_reply_categories/quickReplyCategories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtCommonModule,
    GrpcClientModule.forFeature({
      name: 'CHAT_PACKAGE',
      package: 'CHAT_PACKAGE',
      protoFile: 'conversation.proto',
      urlEnvKey: 'CHAT_GRPC_URL',
    }),
    DatabaseModule,
    RedisModule,
    ConversationModule,
    MessagesModule,
    LabelModule,
    QuickReplyCategoriesModule,
    QuickReplyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

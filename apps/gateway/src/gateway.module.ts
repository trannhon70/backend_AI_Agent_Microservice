import { SocketModule } from '@app/socket';
import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtCommonModule } from 'libs/common/jwt/jwt-common.module';
import { LoggerMiddleware } from 'libs/common/middlewares/logger.middleware';
import { RedisModule } from 'libs/redis/redis.module';
import { join } from 'path';
import { ConversationModule } from './conversation/conversation.module';
import { FanpageModule } from './fanpage/fanpage.module';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { LabelModule } from './label/label.module';
import { MessagesModule } from './messages/messages.module';
import { RolesModule } from './roles/roles.module';
import { UserPageModule } from './user_page/user_page.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { QuickReplyCategoriesModule } from './quick_reply_categories/quick_reply_categories.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtCommonModule,
    SocketModule,
    ClientsModule.registerAsync([
      {
        name: "auth",
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ['auth', 'auth'],
            protoPath: [
              join(process.cwd(), 'libs/proto/src/auth.proto'),
              join(process.cwd(), 'libs/proto/src/role.proto'),
            ],
            url: configService.get<string>('AUTH_GRPC_URL', 'localhost:50051'),
            loader: {
              keepCase: true,
              longs: Number,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: "FANPAGE_PACKAGE",
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ['FANPAGE_PACKAGE'],
            protoPath: [
              join(process.cwd(), 'libs/proto/src/user_page.proto'),
              join(process.cwd(), 'libs/proto/src/fanpage.proto'),
            ],
            url: configService.get<string>('FANPAGE_GRPC_URL', 'localhost:50053'),
            loader: {
              keepCase: true,
              longs: Number,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: "CHAT_PACKAGE",
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ['CHAT_PACKAGE'],
            protoPath: [
              join(process.cwd(), 'libs/proto/src/conversation.proto'),
              join(process.cwd(), 'libs/proto/src/messages.proto'),
              join(process.cwd(), 'libs/proto/src/label.proto'),
            ],
            url: configService.get<string>('CHAT_GRPC_URL', 'localhost:50052'),
            loader: {
              keepCase: true,
              longs: Number,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    RedisModule,
    RolesModule,
    UsersModule,
    FanpageModule,
    UserPageModule,
    ConversationModule,
    MessagesModule,
    WebhooksModule,
    LabelModule,
    QuickReplyCategoriesModule

  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [ClientsModule],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
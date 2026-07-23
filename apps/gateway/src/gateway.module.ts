import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RolesModule } from './roles/roles.module';
import { JwtCommonModule } from 'libs/common/jwt/jwt-common.module';
import { RedisModule } from 'libs/redis/redis.module';
import { LoggerMiddleware } from 'libs/common/middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { FanpageModule } from './fanpage/fanpage.module';
import { UserPageModule } from './user_page/user_page.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtCommonModule,
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
    RedisModule,
    RolesModule,
    UsersModule,
    FanpageModule,
    UserPageModule
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
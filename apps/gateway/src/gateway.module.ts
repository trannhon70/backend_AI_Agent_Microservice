import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RolesModule } from './roles/roles.module';
import { JwtCommonModule } from 'libs/common/jwt/jwt-common.module';
import { RedisModule } from 'libs/redis/redis.module';
import { LoggerMiddleware } from 'libs/common/middlewares/logger.middleware';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtCommonModule,
    ClientsModule.register([{
      name: "auth",
      transport: Transport.GRPC,
      options: {
        package: ['auth', 'auth'],
        protoPath: [
          join(process.cwd(), 'libs/proto/src/auth.proto'),
          join(process.cwd(), 'libs/proto/src/role.proto'),
        ],
        url: "localhost:50051",
        loader: {
          keepCase: true,
          longs: Number,
        },
      }
    }]),
    RedisModule,
    RolesModule
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [ClientsModule],

})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // áp dụng cho mọi route
  }
}
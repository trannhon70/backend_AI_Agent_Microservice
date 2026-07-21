import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([{
      name: "auth",
      transport: Transport.GRPC,
      options: {
        package: "auth",
        protoPath: join(process.cwd(), 'libs/proto/src/auth.proto'),
        url: "localhost:50051"
      }
    }
    ])
  ],
  controllers: [GatewayController],
  providers: [GatewayService],

})
export class GatewayModule { }

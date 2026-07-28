import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { KafkaService } from './kafka.service';
import { KafkaConstants } from './kafka.constants';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: KafkaConstants.InjectionTokens.Client,
        transport: Transport.KAFKA,
        options: {
          producer: {
            allowAutoTopicCreation: true,
            maxInFlightRequests: 1,
            createPartitioner: Partitioners.DefaultPartitioner,
          },
        },
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule { }
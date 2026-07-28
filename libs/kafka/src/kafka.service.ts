import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaConstants } from './kafka.constants';
import { lastValueFrom } from 'rxjs';
import { DomainEvents } from './kafka.events';

@Injectable()
export class KafkaService implements OnModuleInit {
    private readonly logger = new Logger(KafkaService.name);

    constructor(
        @Inject(KafkaConstants.InjectionTokens.Client)
        private readonly kafkaClient: ClientKafka,
    ) { }

    async onModuleInit() {

        // auto subscribe tất cả topic
        Object.values(DomainEvents).forEach((topic) => {
            this.kafkaClient.subscribeToResponseOf(topic);
        });

        await this.kafkaClient.connect();
        this.logger.log('Kafka client connected');
    }

    /**
     * Event fire-and-forget
     */
    publish(topic: string, payload: any): void {
        this.kafkaClient.emit(topic, payload);
    }

    /**
     * Request/Response
     */
    async send<T = any>(topic: string, payload: any): Promise<T> {
        return await lastValueFrom(
            this.kafkaClient.send<T>(topic, payload),
        );
    }
}
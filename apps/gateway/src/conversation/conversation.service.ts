import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ClientGrpc } from '@nestjs/microservices';
import { GetPagingConversationDto } from 'libs/common/dto/conversation/index.dto';
import { RedisService } from 'libs/redis/redis.service';
import { firstValueFrom, Observable } from 'rxjs';

interface ConversationGrpcService {
    GetPaging(data: any): Observable<any>;
}

@Injectable()
export class ConversationService implements OnModuleInit {
    private ConversationGrpcService!: ConversationGrpcService;

    constructor(
        @Inject('CHAT_PACKAGE') private readonly client: ClientGrpc,

        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    onModuleInit() {
        this.ConversationGrpcService = this.client.getService<ConversationGrpcService>('ConversationService');
    }



    async getPaging(query: GetPagingConversationDto) {
        return firstValueFrom(this.ConversationGrpcService.GetPaging(query));
    }

}
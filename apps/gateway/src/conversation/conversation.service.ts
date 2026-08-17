import { SocketService } from '@app/socket';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ClientGrpc } from '@nestjs/microservices';
import { addLabelToConversationDto, GetPagingConversationDto, updateUnreadCountConversationDto } from 'libs/common/dto/conversation/index.dto';
import { RedisService } from 'libs/redis/redis.service';
import { firstValueFrom, Observable } from 'rxjs';

interface ConversationGrpcService {
    GetPaging(data: GetPagingConversationDto): Observable<any>;
    UpdateUnreadCount(data: any): Observable<any>;
    AddLabelToConversation(data: addLabelToConversationDto): Observable<any>;
}

@Injectable()
export class ConversationService implements OnModuleInit {
    private ConversationGrpcService!: ConversationGrpcService;

    constructor(
        @Inject('CHAT_PACKAGE') private readonly client: ClientGrpc,

        private readonly socketService: SocketService,
    ) { }

    onModuleInit() {
        this.ConversationGrpcService = this.client.getService<ConversationGrpcService>('ConversationService');
    }



    async getPaging(query: GetPagingConversationDto) {
        return firstValueFrom(this.ConversationGrpcService.GetPaging(query));
    }

    async updateUnreadCount(dto: updateUnreadCountConversationDto) {
        const result = await firstValueFrom(this.ConversationGrpcService.UpdateUnreadCount({ data: JSON.stringify(dto) }));
        return this.handleSocketUnreadCount(JSON.parse(result.data))
    }

    handleSocketUnreadCount(payload: any) {
        this.socketService.emitToRoom(`page:${payload.page_id}`, 'send_unread_count', payload);
    }

    async addLabelToConversation(dto: addLabelToConversationDto) {
        return firstValueFrom(this.ConversationGrpcService.AddLabelToConversation(dto));
    }

}
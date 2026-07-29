import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { GetPagingMessagesDto } from 'libs/common/dto/messages/index.dto';
import { firstValueFrom, Observable } from 'rxjs';

interface MessagesGrpcService {
    GetPaging(data: GetPagingMessagesDto): Observable<any>;
    Send(data: any): Observable<any>;
}

@Injectable()
export class MessagesService implements OnModuleInit {
    private MessagesGrpcService!: MessagesGrpcService;

    constructor(@Inject('CHAT_PACKAGE') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.MessagesGrpcService = this.client.getService<MessagesGrpcService>('MessagesService');
    }

    async getPaging(dto: GetPagingMessagesDto) {
        return firstValueFrom(this.MessagesGrpcService.GetPaging(dto));
    }

    async send(payload: any) {
        return firstValueFrom(this.MessagesGrpcService.Send({ payload: JSON.stringify(payload) }));
    }

}
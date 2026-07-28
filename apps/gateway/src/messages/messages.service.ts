import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { GetPagingMessagesDto } from 'libs/common/dto/messages/index.dto';
import { firstValueFrom } from 'rxjs';

interface MessagesGrpcService {
    GetPaging(data: GetPagingMessagesDto): any;

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


}
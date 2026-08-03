import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { CreateQuickReplyDto, GetPagingQuickReplyDto, UpdateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';
import { firstValueFrom, Observable } from 'rxjs';

interface QuickReplyGrpcService {
    Create(data: CreateQuickReplyDto): Observable<any>;
    GetPaging(data: GetPagingQuickReplyDto): Observable<any>;
    Update(data: UpdateQuickReplyDto): Observable<any>;
}

@Injectable()
export class QuickReplyService implements OnModuleInit {
    private QuickReplyGrpcService!: QuickReplyGrpcService;

    constructor(@Inject('CHAT_PACKAGE') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.QuickReplyGrpcService = this.client.getService<QuickReplyGrpcService>('QuickReplyService');
    }

    create(dto: CreateQuickReplyDto) {
        return firstValueFrom(this.QuickReplyGrpcService.Create(dto));
    }

    getPaging(query: GetPagingQuickReplyDto) {
        return firstValueFrom(this.QuickReplyGrpcService.GetPaging(query));
    }

    update(dto: UpdateQuickReplyDto) {
        return firstValueFrom(this.QuickReplyGrpcService.Update(dto));
    }
}
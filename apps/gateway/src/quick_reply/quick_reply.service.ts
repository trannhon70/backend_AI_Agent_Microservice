import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { CopyQuickReplyDto, CreateQuickReplyDto, DeleteQuickReplyDto, GetAllQuickReplyDto, GetPagingQuickReplyDto, UpdateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';
import { firstValueFrom, Observable } from 'rxjs';

interface QuickReplyGrpcService {
    Create(data: CreateQuickReplyDto): Observable<any>;
    GetPaging(data: GetPagingQuickReplyDto): Observable<any>;
    Update(data: UpdateQuickReplyDto): Observable<any>;
    Delete(data: DeleteQuickReplyDto): Observable<any>;
    DeleteAll(data: { ids: number[] }): Observable<any>;
    Copy(data: any): Observable<any>;
    GetAll(data: GetAllQuickReplyDto): Observable<any>;
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

    delete(dto: DeleteQuickReplyDto) {
        return firstValueFrom(this.QuickReplyGrpcService.Delete(dto));
    }

    deleteAll(dto: { ids: number[] }) {
        return firstValueFrom(this.QuickReplyGrpcService.DeleteAll(dto));
    }

    copy(dto: CopyQuickReplyDto) {
        const updateDto = {
            source_id: dto.source_id,
            landing_id: dto.landing_id,
            selectedKeys: JSON.stringify(dto.selectedKeys),
            mode: dto.mode
        }
        return firstValueFrom(this.QuickReplyGrpcService.Copy(updateDto));
    }

    getAll(dto: GetAllQuickReplyDto) {
        return firstValueFrom(this.QuickReplyGrpcService.GetAll(dto));
    }
}
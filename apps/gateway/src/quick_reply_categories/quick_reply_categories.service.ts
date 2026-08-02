import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { CreateQuickReplyCategoriesDto, GetAllQuickReplyCategoriesDto, GetPagingQuickReplyCategoriesDto, UpdateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
import { firstValueFrom, Observable } from 'rxjs';

interface QuickReplyCategoriesGrpcService {
    Create(data: CreateQuickReplyCategoriesDto): Observable<any>;
    GetPaging(data: GetPagingQuickReplyCategoriesDto): Observable<any>;
    Delete(data: { id: number }): Observable<any>;
    Update(data: UpdateQuickReplyCategoriesDto): Observable<any>;
    GetAll(data: GetAllQuickReplyCategoriesDto): Observable<any>;
}

@Injectable()
export class QuickReplyCategoriesService implements OnModuleInit {
    private QuickReplyCategoriesGrpcService!: QuickReplyCategoriesGrpcService;

    constructor(@Inject('CHAT_PACKAGE') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.QuickReplyCategoriesGrpcService = this.client.getService<QuickReplyCategoriesGrpcService>('QuickReplyCategoriesService');
    }

    create(dto: CreateQuickReplyCategoriesDto) {
        return firstValueFrom(this.QuickReplyCategoriesGrpcService.Create(dto));
    }

    getPaging(query: GetPagingQuickReplyCategoriesDto) {
        return firstValueFrom(this.QuickReplyCategoriesGrpcService.GetPaging(query));
    }

    delete(id: number) {
        return firstValueFrom(this.QuickReplyCategoriesGrpcService.Delete({ id }));
    }

    update(dto: UpdateQuickReplyCategoriesDto) {
        return firstValueFrom(this.QuickReplyCategoriesGrpcService.Update(dto));
    }

    getAll(dto: GetAllQuickReplyCategoriesDto) {
        return firstValueFrom(this.QuickReplyCategoriesGrpcService.GetAll(dto));
    }

}
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { CreateLabelDto, DeleteLabelDto, GetPagingLabelDto } from 'libs/common/dto/label/index.dto';
import { firstValueFrom, Observable } from 'rxjs';

interface LabelGrpcService {
    GetPaging(data: GetPagingLabelDto): Observable<any>;
    Create(data: CreateLabelDto): Observable<any>;
    Delete(data: DeleteLabelDto): Observable<any>;
}

@Injectable()
export class LabelService implements OnModuleInit {
    private LabelGrpcService!: LabelGrpcService;

    constructor(@Inject('CHAT_PACKAGE') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.LabelGrpcService = this.client.getService<LabelGrpcService>('LabelService');
    }

    getPaging(query: GetPagingLabelDto) {
        return firstValueFrom(this.LabelGrpcService.GetPaging(query));
    }

    create(dto: CreateLabelDto) {
        return firstValueFrom(this.LabelGrpcService.Create(dto));
    }

    delete(dto: DeleteLabelDto) {
        return firstValueFrom(this.LabelGrpcService.Delete(dto));
    }

}
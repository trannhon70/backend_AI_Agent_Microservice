import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { GetPagingLabelDto } from 'libs/common/dto/label/index.dto';
import { firstValueFrom, Observable } from 'rxjs';

interface LabelGrpcService {
    GetPaging(data: GetPagingLabelDto): Observable<any>;
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


}
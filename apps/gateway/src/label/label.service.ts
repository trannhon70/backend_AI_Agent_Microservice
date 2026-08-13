import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { CopyLabelDto, CreateLabelDto, DeleteLabelDto, GetPagingLabelDto, UpdateLabelDto } from 'libs/common/dto/label/index.dto';
import { firstValueFrom, Observable } from 'rxjs';

interface LabelGrpcService {
    GetPaging(data: GetPagingLabelDto): Observable<any>;
    Create(data: CreateLabelDto): Observable<any>;
    Delete(data: DeleteLabelDto): Observable<any>;
    Update(data: UpdateLabelDto): Observable<any>;
    Restore(data: DeleteLabelDto): Observable<any>;
    Copy(data: any): Observable<any>;
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

    update(dto: UpdateLabelDto) {
        return firstValueFrom(this.LabelGrpcService.Update(dto));
    }

    restore(dto: DeleteLabelDto) {
        return firstValueFrom(this.LabelGrpcService.Restore(dto));
    }

    copy(dto: CopyLabelDto) {
        const updateDto = {
            source_id: dto.source_id,
            landing_id: dto.landing_id,
            selectedKeys: JSON.stringify(dto.selectedKeys),
            mode: dto.mode
        }
        return firstValueFrom(this.LabelGrpcService.Copy(updateDto));
    }
}
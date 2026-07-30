import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface QuickReplyCategoriesGrpcService {
    GetPaging(data: any): Observable<any>;

}

@Injectable()
export class QuickReplyCategoriesService implements OnModuleInit {
    // private QuickReplyCategoriesGrpcService!: QuickReplyCategoriesGrpcService;

    // constructor(@Inject('CHAT_PACKAGE') private readonly client: ClientGrpc) { }

    onModuleInit() {
        // this.QuickReplyCategoriesGrpcService = this.client.getService<QuickReplyCategoriesGrpcService>('QuickReplyCategoriesService');
    }

    getPaging(query: any) {
        // return firstValueFrom(this.QuickReplyCategoriesGrpcService.GetPaging(query));
    }



}
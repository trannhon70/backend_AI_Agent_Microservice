import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import type { ClientGrpc } from '@nestjs/microservices';
import { CreateConnectFanPageFacebookDto, SyncingDto, TokenRenewalFacebookDto } from 'libs/common/dto/fanpage/index.dto';
import { RedisService } from 'libs/redis/redis.service';
import { firstValueFrom, Observable } from 'rxjs';

interface FanpageGrpcService {
    CreateConnectPageFacebook(data: CreateConnectFanPageFacebookDto): Observable<any>;
    TokenRenewal(data: TokenRenewalFacebookDto): Observable<any>;
    GetPageId(data: any): Observable<any>;
    Syncing(data: SyncingDto): Observable<any>;
}

@Injectable()
export class FanpageService implements OnModuleInit {
    private FanpageGrpcService!: FanpageGrpcService;

    constructor(
        @Inject('FANPAGE_PACKAGE') private readonly client: ClientGrpc,

        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    onModuleInit() {
        this.FanpageGrpcService = this.client.getService<FanpageGrpcService>('FanPageService');
    }

    async createConnectPageFacebook(payload: CreateConnectFanPageFacebookDto) {
        return firstValueFrom(this.FanpageGrpcService.CreateConnectPageFacebook(payload));
    }

    async tokenRenewal(payload: TokenRenewalFacebookDto) {
        return firstValueFrom(this.FanpageGrpcService.TokenRenewal(payload));
    }

    async getPageId(param: any) {
        return firstValueFrom(this.FanpageGrpcService.GetPageId(param));
    }

    async syncing(payload: SyncingDto) {
        return firstValueFrom(this.FanpageGrpcService.Syncing(payload));
    }

}
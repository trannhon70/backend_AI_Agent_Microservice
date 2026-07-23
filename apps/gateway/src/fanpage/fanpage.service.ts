import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import type { ClientGrpc } from '@nestjs/microservices';
import { RedisService } from 'libs/redis/redis.service';

interface FanpageGrpcService {

}

@Injectable()
export class FanpageService implements OnModuleInit {
    private FanpageGrpcService!: FanpageGrpcService;

    constructor(
        @Inject('auth') private readonly client: ClientGrpc,

        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    onModuleInit() {
        this.FanpageGrpcService = this.client.getService<FanpageGrpcService>('AuthService');
    }



}
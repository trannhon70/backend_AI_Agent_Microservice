import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ClientGrpc } from '@nestjs/microservices';
import { DeleteUserPageDto, GetPagingUserPageDto } from 'libs/common/dto/user_page/index.dto';
import { RedisService } from 'libs/redis/redis.service';
import { firstValueFrom, Observable } from 'rxjs';

interface UserPageGrpcService {
    GetCountProvider(data: any): Observable<any>;
    GetPaging(data: any): Observable<any>;
    Delete(data: DeleteUserPageDto): Observable<any>;
}

@Injectable()
export class UserPageService implements OnModuleInit {
    private UserPageGrpcService!: UserPageGrpcService;

    constructor(
        @Inject('FANPAGE_PACKAGE') private readonly client: ClientGrpc,

        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    onModuleInit() {
        this.UserPageGrpcService = this.client.getService<UserPageGrpcService>('UserPageService');
    }

    async getCountProvider(user_id: number) {
        return firstValueFrom(this.UserPageGrpcService.GetCountProvider({ user_id }));
    }

    async getPaging(user_id: number, query: GetPagingUserPageDto) {
        const data = {
            user_id,
            ...query
        }
        return firstValueFrom(this.UserPageGrpcService.GetPaging(data));
    }

    async delete(param: DeleteUserPageDto) {
        return firstValueFrom(this.UserPageGrpcService.Delete(param));
    }
}
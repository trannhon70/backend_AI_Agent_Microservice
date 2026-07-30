import { Injectable, Inject, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';

import type { ClientGrpc } from '@nestjs/microservices';
import { LoginDto, LoginV1Dto } from '../../../../libs/common/dto/user/login-users.dto';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'libs/redis/redis.service';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { accessExpire, REFRESH_TTL } from 'libs/common/utils';
import { GetByIdUserRequest, UserResponse } from 'libs/common/interfaces/users.interface';

interface UsersGrpcService {
    Login(data: LoginDto): any;
    GetByIdUser(data: GetByIdUserRequest): Observable<any>;
    Logout(data: GetByIdUserRequest): Observable<any>;
    LoginV1(data: LoginV1Dto): Observable<any>;
}

@Injectable()
export class UsersService implements OnModuleInit {
    private usersGrpcService!: UsersGrpcService;

    constructor(
        @Inject('auth') private readonly client: ClientGrpc,

        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    onModuleInit() {
        this.usersGrpcService = this.client.getService<UsersGrpcService>('AuthService');
    }

    async login(dto: LoginDto, option: any) {
        return firstValueFrom(this.usersGrpcService.Login(dto));
    }

    async refresh(refreshToken: any) {
        let payload: any;
        try {
            payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
        } catch (err) {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }

        const lockKey = `user:${payload.id}:refresh_lock`;
        const acquired = await this.redisService.setNX(lockKey, '1', 5); // NX + TTL 5s, tuỳ theo RedisService của bạn hỗ trợ

        if (!acquired) {
            // Có request khác đang refresh, đợi 1 chút rồi lấy session mới nhất thay vì tự refresh nữa
            await new Promise((r) => setTimeout(r, 300));
            const latestSession = await this.redisService.get(`user:${payload.id}:session`);
            if (latestSession?.access_token) {
                return {
                    access_token: latestSession.access_token,
                    refresh_token: latestSession.refresh_token,
                };
            }
            throw new UnauthorizedException('Đang refresh, vui lòng thử lại');
        }

        try {
            const session = await this.redisService.get(`user:${payload.id}:session`);
            if (!session) {
                throw new UnauthorizedException('Phiên đăng nhập không tồn tại hoặc đã bị đăng xuất');
            }
            if (session.refresh_token !== refreshToken) {
                await this.redisService.del(`user:${payload.id}:session`);
                throw new UnauthorizedException('Refresh token đã bị thu hồi');
            }

            const { iat, exp, ...cleanPayload } = payload;
            const newAccessToken = this.jwtService.sign(cleanPayload, { secret: process.env.JWT_SECRET, expiresIn: '1h' });

            await this.redisService.set(
                `user:${cleanPayload.id}:session`,
                { access_token: newAccessToken, refresh_token: refreshToken, expires_at: currentTimestamp() + accessExpire },
                REFRESH_TTL,
            );

            return { access_token: newAccessToken, refresh_token: refreshToken };
        } finally {
            await this.redisService.del(lockKey);
        }
    }

    async GetByIdUser(user_id: number) {
        return firstValueFrom(this.usersGrpcService.GetByIdUser({ user_id }));
    }

    async logout(user_id: number) {
        return firstValueFrom(this.usersGrpcService.Logout({ user_id }));
    }

    async loginV1(dto: LoginV1Dto) {
        return firstValueFrom(this.usersGrpcService.LoginV1(dto));
    }

}
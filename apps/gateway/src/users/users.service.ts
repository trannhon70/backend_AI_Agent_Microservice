import { Injectable, Inject, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import type { ClientGrpc } from '@nestjs/microservices';
import { LoginDto } from './dto/login-users.dto';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'libs/redis/redis.service';
import { currentTimestamp } from 'libs/common/utils/date.util';
const REFRESH_TTL = 30 * 24 * 60 * 60; // 30 ngày, khớp expiresIn refresh token
interface UsersGrpcService {
    Login(data: LoginDto): any;
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

        // ✅ Kiểm tra session trong Redis
        const session = await this.redisService.get(`user:${payload.id}:session`);

        if (!session) {
            throw new UnauthorizedException('Phiên đăng nhập không tồn tại hoặc đã bị đăng xuất');
        }

        if (session.refresh_token !== refreshToken) {
            // refresh token này không khớp với token mới nhất đang lưu
            // → có thể là token cũ đã bị thay thế, hoặc bị đánh cắp dùng lại (replay attack)
            await this.redisService.del(`user:${payload.id}:session`); // hủy luôn session cho an toàn
            throw new UnauthorizedException('Refresh token đã bị thu hồi');
        }

        // ✅ Chỉ lấy field cần, bỏ iat/exp
        const { iat, exp, ...cleanPayload } = payload;

        const newAccessToken = this.jwtService.sign(cleanPayload, { secret: process.env.JWT_SECRET, expiresIn: '1h' });

        const accessExpire = 60 * 60;
        // ✅ Ghi đè lại session mới vào Redis
        await this.redisService.set(
            `user:${cleanPayload.id}:session`,
            { access_token: newAccessToken, refresh_token: refreshToken, expires_at: currentTimestamp() + accessExpire },
            REFRESH_TTL, // ← sửa ở cả login và refresh
        );

        return {
            access_token: newAccessToken,
            refresh_token: refreshToken,
        };

    }

}
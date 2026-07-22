import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { RedisService } from 'libs/redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const authHeader =
            request.headers['authorization'];

        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

        if (!token) {
            throw new UnauthorizedException(
                'Token không tồn tại',
            );
        }

        try {
            const decoded = this.jwtService.verify(token);

            const session = await this.redisService.get(`user:${decoded.id}:session`);

            if (!session) {
                throw new UnauthorizedException(
                    'Phiên đăng nhập không tồn tại',
                );
            }

            if (session.access_token !== token) {
                throw new UnauthorizedException(
                    'Tài khoản đã đăng nhập nơi khác',
                );
            }

            if (Date.now() > session.expiresAt) {
                throw new UnauthorizedException(
                    'Phiên đăng nhập đã hết hạn',
                );
            }

            request.user = decoded;

            return true;
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                throw new UnauthorizedException(
                    'Token đã hết hạn',
                );
            }

            throw err;
        }
    }
}
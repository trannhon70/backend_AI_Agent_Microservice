import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { User } from '@app/database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderEnum } from 'libs/common/enums/role.enum';
import * as bcrypt from 'bcryptjs';
import { RedisService } from 'libs/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { expirationTime } from 'libs/common/utils';
import { LoginDto } from 'apps/gateway/src/users/dto/login-users.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private readonly dataSource: DataSource,

        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) {
    }

    async login(body: LoginDto) {

        const user = await this.userRepo.findOne({
            where: { email: body.email, provider: ProviderEnum.LOCAL },
            relations: { role: true },
        });

        if (!user) {
            throw new RpcException({ code: HttpStatus.NOT_FOUND, message: 'Email không tồn tại!' });
        }
        if (user.is_deleted === true) {
            throw new RpcException({ code: HttpStatus.FORBIDDEN, message: 'Tài khoản này đã bị xóa!' });
        }

        const isMatch = await bcrypt.compare(String(body.password), String(user.password));

        if (!isMatch) {
            throw new RpcException({ code: HttpStatus.UNAUTHORIZED, message: 'Password không đúng!', });
        }

        // Kiểm tra Redis xem có phiên đăng nhập nào chưa
        const currentSession = await this.redisService.get(`user:${user.id}:session`);

        if (currentSession) {
            // Hủy token cũ
            await this.redisService.del(`user:${user.id}:session`);
        }
        const payload = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            created_at: user.created_at,
            is_online: user.is_online,
            avatar: user.avatar ?? "",
            role: {
                id: user.role.id,
                name: user.role.name,
                created_at: user.role.created_at,
            },
        };

        // Access Token (1 giờ)
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

        // Refresh Token (30 ngày)
        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' });
        const accessExpire = 60 * 60; // 1 giờ (giây)

        // Lưu session vào Redis
        await this.redisService.set(`user:${user.id}:session`,
            {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: currentTimestamp() + accessExpire,
            },
            accessExpire,
        );

        // ✅ Cập nhật trạng thái online
        user.is_online = true;
        await this.userRepo.save(user);
        const result = {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: payload,
            startTime: currentTimestamp(),
            endTime: currentTimestamp() + Math.floor(expirationTime / 1000),
        };

        return result;
    }
}
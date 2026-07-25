import { User } from '@app/database/entities/user.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from 'libs/common/dto/user/login-users.dto';
import { ProviderEnum, RoleEnum } from 'libs/common/enums/role.enum';
import { accessExpire, expiresIn, REFRESH_TTL } from 'libs/common/utils';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { RedisService } from 'libs/redis/redis.service';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsersService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(UsersService.name);
    private readonly handleExpired = (key: string) => {
        const match = key.match(/^user:(\d+):session$/);
        if (!match) return;
        const user_id = parseInt(match[1], 10);
        this.logger.debug(`⏳ Key expired: ${user_id}`);
        this.Logout({ user_id: user_id })
    };
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private readonly dataSource: DataSource,

        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    onModuleInit() {
        this.redisService.expiredKeys$.on('expired', this.handleExpired);
    }

    onModuleDestroy() {
        this.redisService.expiredKeys$.off('expired', this.handleExpired);
    }

    async login(body: LoginDto) {

        const user = await this.userRepo.findOne({
            where: { email: body.email, provider: ProviderEnum.LOCAL },
            relations: { role: true },
        });

        if (!user) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Email không tồn tại!' });
        }
        if (user.is_deleted === true) {
            throw new RpcException({ code: GrpcStatus.PERMISSION_DENIED, message: 'Tài khoản này đã bị xóa!' });
        }

        const isMatch = await bcrypt.compare(String(body.password), String(user.password));

        if (!isMatch) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Password không đúng!', });
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
        const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '1h' });

        // Refresh Token (365 ngày)
        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: expiresIn });


        // Lưu session vào Redis
        await this.redisService.set(
            `user:${user.id}:session`,
            { access_token: accessToken, refresh_token: refreshToken, expires_at: currentTimestamp() + accessExpire },
            REFRESH_TTL, // ← sửa ở cả login và refresh
        );

        // ✅ Cập nhật trạng thái online
        user.is_online = true;
        await this.userRepo.save(user);
        const result = {
            access_token: accessToken,
            refresh_token: refreshToken,
        };

        return result;
    }

    async GetByIdUser(dto: any) {
        const { user_id } = dto
        const cacheKey = `user:${user_id}`;

        const cacheUser = await this.redisService.get(cacheKey);
        if (cacheUser) {
            return cacheUser;
        }

        const user = await this.dataSource.query(`
      SELECT 
        (to_jsonb(u) - 'password') || jsonb_build_object(
          'role', to_jsonb(r)
        ) AS user
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
      LIMIT 1
    `, [user_id]);

        if (!user.length) {
            throw new Error('User not found');
        }

        const userData = user[0].user;
        //Lưu redis 1 tiếng
        await this.redisService.set(cacheKey, userData, 3600);

        return userData;
    }

    async Logout(dto: any) {
        try {
            const { user_id } = dto
            await this.userRepo.update({ id: user_id }, { is_online: false });
            return await this.redisService.del(`user:${user_id}:session`);
        } catch (error) {
            throw error
        }
    }

    async LoginV1(dto: any) {
        let user = await this.userRepo.findOne({
            where: { email: dto.email, provider: dto.provider },
            relations: { role: true },
        });

        if (!user) {
            user = await this.userRepo.save({
                email: dto.email,
                full_name: dto.full_name,
                avatar: dto.avatar,
                is_online: true,
                role_id: RoleEnum.ADMIN_MANAGE,
                provider: dto.provider,
                created_at: currentTimestamp(),
            });
        } else {
            await this.userRepo.update(
                { id: user.id },
                { is_online: true },
            );
        }

        await this.redisService.del(`user:${user.id}:session`);

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
        const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '1h' });

        // Refresh Token (365 ngày)
        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: expiresIn });
        // Lưu session vào Redis
        await this.redisService.set(
            `user:${user.id}:session`,
            { access_token: accessToken, refresh_token: refreshToken, expires_at: currentTimestamp() + accessExpire },
            REFRESH_TTL, // ← sửa ở cả login và refresh
        );

        // ✅ Cập nhật trạng thái online
        user.is_online = true;
        await this.userRepo.save(user);
        const result = {
            access_token: accessToken,
            refresh_token: refreshToken,
        };

        return result;

    }
}
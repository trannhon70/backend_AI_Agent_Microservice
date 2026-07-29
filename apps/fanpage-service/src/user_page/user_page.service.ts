import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserPage } from '@app/database/entities/user_page.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { createUserPageDto, DeleteUserPageDto, getPagingUserPageActiveDto } from 'libs/common/dto/user_page/index.dto';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { ProviderEnum } from 'libs/common/enums/role.enum';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { User } from '@app/database/entities/user.entity';

@Injectable()
export class UserPageService {

    constructor(
        @InjectRepository(UserPage)
        private UserPageRepo: Repository<UserPage>,

        @InjectRepository(Fanpage)
        private fanpageRepo: Repository<Fanpage>,

        @InjectRepository(User)
        private userRepo: Repository<User>,

        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
    ) {
    }

    async GetCountProvider(dto: any) {
        const { user_id } = dto;
        const result = await this.UserPageRepo
            .createQueryBuilder('user_page')
            .select('user_page.provider', 'provider')
            .addSelect('COUNT(*)', 'count')
            .where('user_page.user_id = :user_id', { user_id })
            .groupBy('user_page.provider')
            .getRawMany();

        const total = result.reduce(
            (sum, item) => sum + Number(item.count),
            0,
        );

        return [
            {
                provider: 'Tất cả',
                count: total,
            },
            ...result.map(item => ({
                provider: item.provider,
                count: Number(item.count),
            })),
        ];
    }

    async GetPaging(query: any) {
        const pageIndex = query.pageIndex ? query.pageIndex : 1;
        const limit = query.limit ? query.limit : 10;
        const search = query.search || '';
        const provider = query.provider || '';
        const user_id = query.user_id;

        const qb = this.UserPageRepo.createQueryBuilder('user_page')
            .leftJoinAndSelect('user_page.page', 'page')
            .where('user_page.user_id = :user_id', { user_id })

        if (provider) {
            qb.andWhere('user_page.provider = :provider', {
                provider,
            });
        }

        if (search?.trim()) {
            qb.addSelect(`ts_rank_cd(page.search_vector, websearch_to_tsquery('simple', unaccent(:search)))`, 'rank')
                .andWhere(`page.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`, { search: search.trim() })
                .orderBy('rank', 'DESC')
                .addOrderBy('user_page.created_at', 'DESC')
                .addOrderBy('user_page.id', 'DESC');
        } else {
            qb.orderBy('user_page.created_at', 'DESC').addOrderBy('user_page.id', 'DESC');
        }

        qb.skip((pageIndex - 1) * limit).take(limit + 1);
        const rows = await qb.getMany();
        const hasMore = rows.length > limit;

        return {
            pageIndex,
            limit,
            hasMore,
            data: hasMore ? rows.slice(0, limit) : rows,
        };
    }

    async Delete(param: DeleteUserPageDto) {
        return await this.UserPageRepo.delete(param)
    }

    async GetPagingUserPageActive(query: getPagingUserPageActiveDto) {
        const { pageIndex = 1, limit = 10, search, page_id } = query;
        const fanpage = await this.fanpageRepo.findOne({ where: { page_id }, select: { id: true }, });
        if (!fanpage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Không tìm thấy fanpage!' });
        }

        const qb = this.UserPageRepo
            .createQueryBuilder('user_page')
            .leftJoinAndSelect('user_page.user', 'u')
            .select('user_page')
            .addSelect(['u.id', 'u.email', 'u.full_name', 'u.avatar'])
            .where('user_page.fanpage_id = :fanpage_id', { fanpage_id: fanpage.id })

        if (search?.trim()) {
            qb.addSelect(`ts_rank_cd(u.search_vector, websearch_to_tsquery('simple', unaccent(:search)))`, 'rank')
                .andWhere(`u.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`, { search: search.trim() })
                .orderBy('rank', 'DESC')
                .addOrderBy('user_page.created_at', 'DESC')
                .addOrderBy('user_page.id', 'DESC');
        } else {
            qb.orderBy('user_page.created_at', 'DESC').addOrderBy('user_page.id', 'DESC');
        }

        qb.skip((pageIndex - 1) * limit).take(limit + 1);
        const rows = await qb.getMany();
        const hasMore = rows.length > limit;

        return {
            pageIndex,
            limit,
            hasMore,
            data: hasMore ? rows.slice(0, limit) : rows,
        };
    }

    async CreateUserPage(dto: createUserPageDto) {
        const { email, role, provider, page_id } = dto;

        const check_user = await this.userRepo.findOne({ where: { email: email, provider: provider } });

        if (!check_user) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Tài khoản này hiện tại chưa được đăng ký trong hệ thống!' });
        }

        const check_fanPage: any = await this.fanpageRepo.findOne({ where: { page_id: page_id } })
        const check_userPage = await this.UserPageRepo.exists({ where: { user_id: check_user.id, fanpage_id: check_fanPage.id } });

        if (check_userPage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Tài khoản này đã tồn tại trong page!' });
        }
        const data = {
            user_id: check_user.id,
            fanpage_id: check_fanPage.id,
            provider: ProviderEnum.FACEBOOK,
            role: role,
            created_at: currentTimestamp(),
        }
        return await this.UserPageRepo.save(data)

    }
}
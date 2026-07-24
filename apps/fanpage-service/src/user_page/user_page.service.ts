import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
// import { RoleRepository } from './role.repository';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPage } from '@app/database/entities/user_page.entity';
import { GetPagingUserPageDto } from 'libs/common/dto/user_page/index.dto';

@Injectable()
export class UserPageService {

    constructor(
        @InjectRepository(UserPage)
        private UserPageRepo: Repository<UserPage>,

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



}
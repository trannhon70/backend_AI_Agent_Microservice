import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
// import { RoleRepository } from './role.repository';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPage } from '@app/database/entities/user_page.entity';

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





}
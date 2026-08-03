import { Fanpage } from '@app/database/entities/fanpage.entity';
import { QuickReplyCategory } from '@app/database/entities/quick_reply_category.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuickReplyCategoriesDto, GetPagingQuickReplyCategoriesDto, UpdateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { RedisService } from 'libs/redis/redis.service';
import { QueryFailedError, Repository } from 'typeorm';


@Injectable()
export class QuickReplyCategoriesService {
    private readonly logger = new Logger(QuickReplyCategoriesService.name);
    constructor(

        @InjectRepository(QuickReplyCategory)
        private QuickReplyCategoryRepo: Repository<QuickReplyCategory>,

        @InjectRepository(Fanpage)
        private fanpageRepo: Repository<Fanpage>,
        // private readonly roleRepo: RoleRepository,
        private readonly redisService: RedisService,
    ) {
    }

    private invalidateCache(pageId: string) {
        return this.redisService.del(`quick_reply_categories:${pageId}`)
            .catch(err => this.logger.warn(`Failed to invalidate cache for ${pageId}`, err));
    }

    async Create(dto: CreateQuickReplyCategoriesDto) {
        const fanpage = await this.fanpageRepo.findOneBy({ page_id: dto.page_id });

        if (!fanpage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Không tìm thấy trang fanpage!' });
        }

        try {
            const saved = await this.QuickReplyCategoryRepo.save({
                name: dto.name,
                color: dto.color,
                fanpage_id: fanpage.id,
                created_at: currentTimestamp(),
            });
            await this.invalidateCache(dto.page_id);
            return saved;
        } catch (error) {
            this.logger.error(error);

            if (
                error instanceof QueryFailedError &&
                error.driverError?.code === '23505'
            ) {

                throw new RpcException({
                    code: GrpcStatus.ALREADY_EXISTS,
                    message: 'Chủ đề này đã tồn tại!',
                });
            }

            throw new RpcException({
                code: GrpcStatus.INTERNAL,
                message: 'Internal server error',
            });
        }
    }

    async GetPaging(query: GetPagingQuickReplyCategoriesDto) {
        const { pageIndex = 1, limit = 10, search, page_id } = query;
        const fanpage = await this.fanpageRepo.findOne({ where: { page_id }, select: { id: true }, });

        if (!fanpage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Không tìm thấy fanpage!' });
        }

        const qb = this.QuickReplyCategoryRepo
            .createQueryBuilder('categories')
            .select(['categories.id', 'categories.name', 'categories.color', 'categories.created_at'])
            .where('categories.fanpage_id = :fanpage_id', { fanpage_id: fanpage.id })


        if (search?.trim()) {
            qb.addSelect(`ts_rank_cd(categories.search_vector, websearch_to_tsquery('simple', unaccent(:search)))`, 'rank')
                .andWhere(`categories.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`, { search: search.trim() })
                .orderBy('rank', 'DESC')
                .addOrderBy('categories.created_at', 'DESC')
                .addOrderBy('categories.id', 'DESC');
        } else {
            qb.orderBy('categories.created_at', 'DESC').addOrderBy('categories.id', 'DESC');
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

    async Delete(dto: any) {
        const result = await this.QuickReplyCategoryRepo.delete({ id: dto.id });
        // Xóa cache khi xóa danh mục
        await this.invalidateCache(dto.page_id);
        return result;
    }

    async Update(dto: UpdateQuickReplyCategoriesDto) {
        try {
            const result = await this.QuickReplyCategoryRepo.update({ id: dto.id }, {
                name: dto.name,
                color: dto.color,
            });
            await this.invalidateCache(dto.page_id);
            return result;
        } catch (error) {
            this.logger.error(error);

            if (
                error instanceof QueryFailedError &&
                error.driverError?.code === '23505'
            ) {
                throw new RpcException({
                    code: GrpcStatus.ALREADY_EXISTS,
                    message: 'Chủ đề này đã tồn tại!',
                });
            }

            throw new RpcException({
                code: GrpcStatus.INTERNAL,
                message: 'Internal server error',
            });
        }
    }

    async GetAll(dto: { page_id: string }) {
        const cacheKey = `quick_reply_categories:${dto.page_id}`;
        // 1. Thử lấy từ cache trước
        try {
            const cached = await this.redisService.get(cacheKey);
            if (cached) return cached;
        } catch (err) {
            this.logger.warn(`Redis get failed for ${cacheKey}, fallback to DB`, err);
        }

        // 2. Cache miss → query DB như cũ
        const fanpage = await this.fanpageRepo.findOne({ where: { page_id: dto.page_id }, select: { id: true }, });
        if (!fanpage) {
            throw new RpcException({
                code: GrpcStatus.NOT_FOUND,
                message: 'Fanpage not found',
            });
        }
        const data = await this.QuickReplyCategoryRepo.find({
            where: { fanpage_id: fanpage.id },
            order: { created_at: 'DESC', id: 'DESC' },
        });
        // 3. Lưu vào cache
        this.redisService.set(cacheKey, data, 60 * 60).catch(err =>
            this.logger.warn(`Redis set failed for ${cacheKey}`, err)
        );
        return data;

    }
}

import { Fanpage } from '@app/database/entities/fanpage.entity';
import { QuickReply } from '@app/database/entities/quick_reply.entity';
import { QuickReplyCategory } from '@app/database/entities/quick_reply_category.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CopyQuickReplyDto, CreateQuickReplyDto, DeleteQuickReplyDto, GetAllQuickReplyDto, GetPagingQuickReplyDto, UpdateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { RedisService } from 'libs/redis/redis.service';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
const ONE_DAY = 24 * 60 * 60;

@Injectable()
export class QuickReplyService {
    private readonly logger = new Logger(QuickReplyService.name);
    constructor(
        @InjectRepository(QuickReply)
        private quickReplyRepo: Repository<QuickReply>,

        @InjectRepository(QuickReplyCategory)
        private quickReplyCategoryRepo: Repository<QuickReplyCategory>,

        @InjectRepository(Fanpage)
        private fanpageRepo: Repository<Fanpage>,

        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
        private readonly redisService: RedisService,
    ) { }

    private invalidateCache(pageId: string | undefined) {
        return this.redisService.del(`quickReply:${pageId}`)
            .catch(err => this.logger.warn(`Failed to invalidate cache for ${pageId}`, err));
    }

    async Create(dto: CreateQuickReplyDto) {
        const fanpage = await this.fanpageRepo.findOneBy({ page_id: dto.page_id });

        if (!fanpage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Không tìm thấy trang fanpage!' });
        }
        const saved = await this.quickReplyRepo.save({
            content: dto.content,
            quick_reply_category_id:
                dto.quick_reply_category_id && dto.quick_reply_category_id > 0
                    ? dto.quick_reply_category_id
                    : null,
            fanpage_id: fanpage.id,
            created_at: currentTimestamp(),
        });
        await this.invalidateCache(dto.page_id)
        // query lại kèm relation
        return this.quickReplyRepo.findOne({
            where: { id: saved.id },
            relations: { quickReplyCategory: true },
            select: {
                id: true,
                content: true,
                created_at: true,
                quick_reply_category_id: true,
                quickReplyCategory: { id: true, name: true, color: true },
            },
        });
    }

    async GetPaging(query: GetPagingQuickReplyDto) {
        const { pageIndex = 1, limit = 10, search, page_id } = query;
        const fanpage = await this.fanpageRepo.findOne({ where: { page_id }, select: { id: true }, });

        if (!fanpage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Không tìm thấy fanpage!' });
        }

        const qb = this.quickReplyRepo
            .createQueryBuilder('reply')
            .leftJoinAndSelect('reply.quickReplyCategory', 'quickReplyCategory')
            .select([
                'reply.id',
                'reply.content',
                'reply.created_at',
                'reply.quick_reply_category_id',
                'quickReplyCategory.id',      // bắt buộc phải có
                'quickReplyCategory.name',
                'quickReplyCategory.color',
            ])
            .where('reply.fanpage_id = :fanpage_id', { fanpage_id: fanpage.id })

        if (search?.trim()) {
            qb.addSelect(`ts_rank_cd(reply.search_vector, websearch_to_tsquery('simple', unaccent(:search)))`, 'rank')
                .andWhere(`reply.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`, { search: search.trim() })
                .orderBy('rank', 'DESC')
                .addOrderBy('reply.created_at', 'DESC')
                .addOrderBy('reply.id', 'DESC');
        } else {
            qb.orderBy('reply.created_at', 'DESC').addOrderBy('reply.id', 'DESC');
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

    async Update(dto: UpdateQuickReplyDto) {
        try {
            await this.quickReplyRepo.update({ id: dto.id }, {
                content: dto.content,
                quick_reply_category_id:
                    dto.quick_reply_category_id && dto.quick_reply_category_id > 0
                        ? dto.quick_reply_category_id
                        : null,
            });
            await this.invalidateCache(dto.page_id)
            // query lại kèm relation
            return this.quickReplyRepo.findOne({
                where: { id: dto.id },
                relations: { quickReplyCategory: true },
                select: {
                    id: true,
                    content: true,
                    created_at: true,
                    quick_reply_category_id: true,
                    quickReplyCategory: { id: true, name: true, color: true },
                },
            });
        } catch (error) {
            this.logger.error(error);
            throw new RpcException({
                code: GrpcStatus.INTERNAL,
                message: 'Internal server error',
            });
        }
    }

    async Delete(dto: DeleteQuickReplyDto) {
        await this.invalidateCache(dto.page_id)
        return this.quickReplyRepo.delete({ id: dto.id });
    }

    async DeleteAll(dtos: { ids: number[] }) {
        return this.quickReplyRepo.delete({ id: In(dtos.ids) });
    }


    async Copy(dto: CopyQuickReplyDto) {
        const { source_id, landing_id, selectedKeys, mode } = dto;
        if (source_id === landing_id) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'source_id và landing_id không được trùng nhau' });
        }
        if (mode === 'replace') {
            await this.quickReplyRepo.delete({ fanpage_id: landing_id });
            await this.quickReplyCategoryRepo.delete({ fanpage_id: landing_id });
        }
        await this.copySelectedReplies(selectedKeys, landing_id);
        return true;
    }

    private async copySelectedReplies(selectedKeys: number[], landing_id?: number) {
        const categoryCache = new Map<number, number>(); // originalCategoryId -> newCategoryId

        for (const id of selectedKeys) {
            const reply: any = await this.quickReplyRepo.findOne({
                where: { id },
                relations: { quickReplyCategory: true },
            });

            if (!reply) continue; // phòng trường hợp id không tồn tại

            const categoryId = reply.quick_reply_category_id;

            if (categoryId) {
                let newCategoryId: number;

                if (categoryCache.has(categoryId)) {
                    newCategoryId = categoryCache.get(categoryId)!;
                } else {
                    const existingCategory = await this.quickReplyCategoryRepo.findOneBy({
                        name: reply.quickReplyCategory.name,
                        fanpage_id: landing_id,
                    });

                    if (existingCategory) {
                        newCategoryId = existingCategory.id;
                    } else {
                        const replyCategory = await this.quickReplyCategoryRepo.save({
                            name: reply.quickReplyCategory.name,
                            color: reply.quickReplyCategory.color,
                            fanpage_id: landing_id,
                            created_at: currentTimestamp(),
                        });
                        newCategoryId = replyCategory.id;
                    }

                    categoryCache.set(categoryId, newCategoryId);
                }

                await this.quickReplyRepo.save({
                    content: reply.content,
                    quick_reply_category_id: newCategoryId,
                    fanpage_id: landing_id,
                    created_at: currentTimestamp(),
                });
            } else {
                await this.quickReplyRepo.save({
                    content: reply.content,
                    fanpage_id: landing_id,
                    created_at: currentTimestamp(),
                });
            }
        }
    }

    async GetAll(dto: GetAllQuickReplyDto) {
        const cacheKey = `quickReply:${dto.page_id}`;
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
        const data = await this.quickReplyRepo.find({
            where: { fanpage_id: fanpage.id },
            relations: { quickReplyCategory: true },
            select: {
                id: true,
                content: true,
                created_at: true,
                quick_reply_category_id: true,
                quickReplyCategory: { id: true, name: true, color: true },
            },
            order: { created_at: 'DESC', id: 'DESC' },
            take: 300,
        });
        // 3. Lưu vào cache
        this.redisService.set(cacheKey, data, ONE_DAY).catch(err =>
            this.logger.warn(`Redis set failed for ${cacheKey}`, err)
        );
        return data;
    }
}
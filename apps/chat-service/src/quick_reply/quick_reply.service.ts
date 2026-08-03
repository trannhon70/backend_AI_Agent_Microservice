
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { QuickReply } from '@app/database/entities/quick_reply.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuickReplyDto, GetPagingQuickReplyDto, UpdateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { DataSource, QueryFailedError, Repository } from 'typeorm';


@Injectable()
export class QuickReplyService {
    private readonly logger = new Logger(QuickReplyService.name);
    constructor(
        @InjectRepository(QuickReply)
        private quickReplyRepo: Repository<QuickReply>,

        @InjectRepository(Fanpage)
        private fanpageRepo: Repository<Fanpage>,

        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
    ) { }

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
}
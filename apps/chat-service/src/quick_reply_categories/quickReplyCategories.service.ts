import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { Label } from '@app/database/entities/label.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { QuickReplyCategory } from '@app/database/entities/quick_reply_category.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuickReplyCategoriesDto, GetPagingQuickReplyCategoriesDto, UpdateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { DataSource, QueryFailedError, Repository } from 'typeorm';


@Injectable()
export class QuickReplyCategoriesService {
    private readonly logger = new Logger(QuickReplyCategoriesService.name);
    constructor(
        @InjectRepository(LiveMessage)
        private liveMessageRepo: Repository<LiveMessage>,

        @InjectRepository(QuickReplyCategory)
        private QuickReplyCategoryRepo: Repository<QuickReplyCategory>,

        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,

        @InjectRepository(Label)
        private labelRepo: Repository<Label>,


        @InjectRepository(Fanpage)
        private fanpageRepo: Repository<Fanpage>,
        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
    ) {
    }

    async Create(dto: CreateQuickReplyCategoriesDto) {
        const fanpage = await this.fanpageRepo.findOneBy({
            page_id: dto.page_id,
        });

        if (!fanpage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Không tìm thấy trang fanpage!' });
        }

        try {
            return await this.QuickReplyCategoryRepo.save({
                name: dto.name,
                color: dto.color,
                fanpage_id: fanpage.id,
                created_at: currentTimestamp(),
            });
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

    async Delete(id: number) {
        return this.QuickReplyCategoryRepo.delete({ id });
    }

    async Update(dto: UpdateQuickReplyCategoriesDto) {
        try {
            return await this.QuickReplyCategoryRepo.update({ id: dto.id }, {
                name: dto.name,
                color: dto.color,
            });
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
        const fanpage = await this.fanpageRepo.findOne({ where: { page_id: dto.page_id }, select: { id: true }, });
        if (!fanpage) {
            throw new RpcException({
                code: GrpcStatus.NOT_FOUND,
                message: 'Fanpage not found',
            });
        }
        return this.QuickReplyCategoryRepo.find({ where: { fanpage_id: fanpage.id } });
    }
}
import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { Label } from '@app/database/entities/label.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CopyLabelDto, CreateLabelDto, DeleteLabelDto, GetAllLabelDto, GetPagingLabelDto, UpdateLabelDto } from 'libs/common/dto/label/index.dto';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import { LabelsRepository } from './labels.repository';
import { RedisService } from 'libs/redis/redis.service';
const ONE_DAY = 24 * 60 * 60;


@Injectable()
export class LabelService {
    private readonly logger = new Logger(LabelService.name);
    constructor(
        @InjectRepository(LiveMessage)
        private liveMessageRepo: Repository<LiveMessage>,

        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,

        @InjectRepository(Label)
        private labelRepo: Repository<Label>,

        private readonly labelsRepository: LabelsRepository,

        @InjectRepository(Fanpage)
        private fanpageRepo: Repository<Fanpage>,
        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
        private readonly redisService: RedisService,
    ) {
    }
    private invalidateCache(pageId: string | undefined) {
        return this.redisService.del(`label:${pageId}`)
            .catch(err => this.logger.warn(`Failed to invalidate cache for ${pageId}`, err));
    }

    async GetPaging(query: GetPagingLabelDto) {
        const { pageIndex = 1, limit = 10, search, page_id, is_deleted } = query;
        const fanpage = await this.fanpageRepo.findOne({ where: { page_id }, select: { id: true }, });

        if (!fanpage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Không tìm thấy fanpage!' });
        }

        const qb = this.labelRepo
            .createQueryBuilder('label')
            .select(['label.id', 'label.name', 'label.color', 'label.created_at', 'label.is_deleted'])
            .where('label.fanpage_id = :fanpage_id', { fanpage_id: fanpage.id })
            .andWhere('label.is_deleted = :is_deleted', { is_deleted });

        if (search?.trim()) {
            qb.addSelect(`ts_rank_cd(label.search_vector, websearch_to_tsquery('simple', unaccent(:search)))`, 'rank')
                .andWhere(`label.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`, { search: search.trim() })
                .orderBy('rank', 'DESC')
                .addOrderBy('label.created_at', 'DESC')
                .addOrderBy('label.id', 'DESC');
        } else {
            qb.orderBy('label.created_at', 'DESC').addOrderBy('label.id', 'DESC');
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

    async Create(dto: CreateLabelDto) {
        const fanpage = await this.fanpageRepo.findOneBy({
            page_id: dto.page_id,
        });

        if (!fanpage) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Không tìm thấy trang fanpage!' });
        }

        try {

            const saved = await this.labelRepo.save({
                name: dto.name,
                color: dto.color,
                fanpage_id: fanpage.id,
                created_at: currentTimestamp(),
            });
            await this.invalidateCache(dto.page_id);
            return saved
        } catch (error) {
            this.logger.error(error);

            if (
                error instanceof QueryFailedError &&
                error.driverError?.code === '23505'
            ) {

                throw new RpcException({
                    code: GrpcStatus.ALREADY_EXISTS,
                    message: 'Thẻ hội thoại này đã tồn tại!',
                });
            }

            throw new RpcException({
                code: GrpcStatus.INTERNAL,
                message: 'Internal server error',
            });
        }
    }

    async Delete(dto: DeleteLabelDto) {
        const result = await this.labelRepo.delete(dto.id)
        await this.invalidateCache(dto.page_id);
        return result
    }

    async Update(dto: UpdateLabelDto) {
        try {

            const result = await this.labelsRepository.update(dto.id, {
                name: dto.name,
                color: dto.color,
                is_deleted: dto.is_deleted
            });
            await this.invalidateCache(dto.page_id);
            return result
        } catch (error) {
            this.logger.error(error);

            if (
                error instanceof QueryFailedError &&
                error.driverError?.code === '23505'
            ) {
                throw new RpcException({
                    code: GrpcStatus.ALREADY_EXISTS,
                    message: 'Thẻ hội thoại này đã tồn tại!',
                });
            }

            throw new RpcException({
                code: GrpcStatus.INTERNAL,
                message: 'Internal server error',
            });
        }
    }

    async Restore(dto: DeleteLabelDto) {
        try {
            return await this.labelsRepository.update(dto.id, { is_deleted: false });
        } catch (error) {
            this.logger.error(error);

            if (
                error instanceof QueryFailedError &&
                error.driverError?.code === '23505'
            ) {
                throw new RpcException({
                    code: GrpcStatus.ALREADY_EXISTS,
                    message: 'Thẻ hội thoại này đã tồn tại!',
                });
            }

            throw new RpcException({
                code: GrpcStatus.INTERNAL,
                message: 'Internal server error',
            });
        }
    }

    async Copy(dto: CopyLabelDto) {
        const { source_id, landing_id, selectedKeys, mode } = dto;
        if (source_id === landing_id) {
            throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'source_id và landing_id không được trùng nhau' });
        }
        if (mode === 'replace') {
            await this.labelRepo.delete({ fanpage_id: landing_id });
        }

        await this.copySelectedLabel(selectedKeys, landing_id);
        return true;
    }

    private async copySelectedLabel(selectedKeys: number[], landing_id?: number) {
        for (const id of selectedKeys) {
            const label: any = await this.labelRepo.findOne({ where: { id: id } })
            const existing = await this.labelRepo.findOneBy({
                name: label.name,
                fanpage_id: landing_id
            })
            if (!existing) {
                await this.labelRepo.save({
                    name: label.name,
                    color: label.color,
                    fanpage_id: landing_id,
                    created_at: currentTimestamp(),
                })
            }
        }
    }

    async DeleteAll(dtos: { ids: number[] }) {
        return this.labelRepo.delete({ id: In(dtos.ids) });
    }

    async GetAll(dto: GetAllLabelDto) {
        const cacheKey = `label:${dto.page_id}`;
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
        const data = await this.labelRepo.find({
            where: { fanpage_id: fanpage.id, is_deleted: false },
            select: { id: true, name: true, color: true },
            order: { created_at: 'DESC', id: 'DESC' },
        });
        // 3. Lưu vào cache
        this.redisService.set(cacheKey, data, ONE_DAY).catch(err =>
            this.logger.warn(`Redis set failed for ${cacheKey}`, err)
        );
        return data;

    }
}
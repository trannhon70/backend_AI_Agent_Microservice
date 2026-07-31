import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { Label } from '@app/database/entities/label.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { QuickReplyCategory } from '@app/database/entities/quick_reply_category.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
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

}
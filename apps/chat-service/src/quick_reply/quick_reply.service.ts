
import { QuickReply } from '@app/database/entities/quick_reply.entity';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { DataSource, QueryFailedError, Repository } from 'typeorm';


@Injectable()
export class QuickReplyService {
    private readonly logger = new Logger(QuickReplyService.name);
    constructor(
        @InjectRepository(QuickReply)
        private quickReplyRepo: Repository<QuickReply>,

        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
    ) { }

    async Create(dto: CreateQuickReplyDto) {
        return await this.quickReplyRepo.save({
            content: dto.content,
            quick_reply_category_id: dto.quick_reply_category_id,
            created_at: currentTimestamp(),
        });
    }


}
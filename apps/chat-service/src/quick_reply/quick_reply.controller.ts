import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuickReplyService } from './quick_reply.service';
import { CreateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';

@Controller()
export class QuickReplyController {
    constructor(private readonly QuickReplyService: QuickReplyService) { }



    @GrpcMethod('QuickReplyService', 'Create')
    async Create(dto: CreateQuickReplyDto) {
        const result = await this.QuickReplyService.Create(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Thêm mới reply nhanh thành công!',
            data: JSON.stringify(result),
        };
    }



}
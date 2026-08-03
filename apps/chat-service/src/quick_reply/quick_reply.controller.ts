import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuickReplyService } from './quick_reply.service';
import { CreateQuickReplyDto, GetPagingQuickReplyDto, UpdateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';

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

    @GrpcMethod('QuickReplyService', 'GetPaging')
    async GetPaging(query: GetPagingQuickReplyDto) {
        const result = await this.QuickReplyService.GetPaging(query);
        return {
            code: GrpcStatus.OK,
            message: 'Lấy danh sách reply nhanh thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyService', 'Update')
    async Update(dto: UpdateQuickReplyDto) {
        const result = await this.QuickReplyService.Update(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Cập nhật reply nhanh thành công!',
            data: JSON.stringify(result),
        };
    }
}
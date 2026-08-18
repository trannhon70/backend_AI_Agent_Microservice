import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateQuickReplyDto, DeleteQuickReplyDto, GetAllQuickReplyDto, GetPagingQuickReplyDto, UpdateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';
import { QuickReplyService } from './quick_reply.service';

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

    @GrpcMethod('QuickReplyService', 'Delete')
    async Delete(dto: DeleteQuickReplyDto) {
        const result = await this.QuickReplyService.Delete(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Xóa reply nhanh thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyService', 'DeleteAll')
    async DeleteAll(dtos: { ids: number[] }) {
        const result = await this.QuickReplyService.DeleteAll(dtos);
        return {
            code: GrpcStatus.OK,
            message: 'Xóa reply nhanh thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyService', 'Copy')
    async Copy(dto: any) {
        const updateDto = {
            source_id: dto.source_id,
            landing_id: dto.landing_id,
            selectedKeys: JSON.parse(dto.selectedKeys),
            mode: dto.mode
        }
        const result = await this.QuickReplyService.Copy(updateDto);
        return {
            code: GrpcStatus.OK,
            message: 'Sao chép thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyService', 'GetAll')
    async GetAll(dto: GetAllQuickReplyDto) {
        const result = await this.QuickReplyService.GetAll(dto);
        return {
            code: GrpcStatus.OK,
            message: 'get all success!',
            data: JSON.stringify(result),
        };
    }
}
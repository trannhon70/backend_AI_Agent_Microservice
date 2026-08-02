import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateQuickReplyCategoriesDto, GetAllQuickReplyCategoriesDto, GetPagingQuickReplyCategoriesDto, UpdateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
import { QuickReplyCategoriesService } from './quickReplyCategories.service';

@Controller()
export class QuickReplyCategoriesController {
    constructor(private readonly QuickReplyCategoriesService: QuickReplyCategoriesService) { }

    @GrpcMethod('QuickReplyCategoriesService', 'Create')
    async Create(dto: CreateQuickReplyCategoriesDto) {
        const result = await this.QuickReplyCategoriesService.Create(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Thêm mới chủ đề thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyCategoriesService', 'GetPaging')
    async GetPaging(dto: GetPagingQuickReplyCategoriesDto) {
        const result = await this.QuickReplyCategoriesService.GetPaging(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Lấy danh sách chủ đề thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyCategoriesService', 'Delete')
    async Delete(dto: { id: number }) {
        const result = await this.QuickReplyCategoriesService.Delete(dto.id);
        return {
            code: GrpcStatus.OK,
            message: 'Xóa chủ đề thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyCategoriesService', 'Update')
    async Update(dto: UpdateQuickReplyCategoriesDto) {
        const result = await this.QuickReplyCategoriesService.Update(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Cập nhật chủ đề thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyCategoriesService', 'GetAll')
    async GetAll(dto: GetAllQuickReplyCategoriesDto) {
        const result = await this.QuickReplyCategoriesService.GetAll(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Lấy danh sách chủ đề thành công!',
            data: JSON.stringify(result),
        };
    }

}
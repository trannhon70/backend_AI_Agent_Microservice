import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateQuickReplyCategoriesDto, GetPagingQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
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
            message: 'get paging success!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('QuickReplyCategoriesService', 'Delete')
    async Delete(dto: { id: number }) {
        const result = await this.QuickReplyCategoriesService.Delete(dto.id);
        return {
            code: GrpcStatus.OK,
            message: 'get paging success!',
            data: JSON.stringify(result),
        };
    }
}
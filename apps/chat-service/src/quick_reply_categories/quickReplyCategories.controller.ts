import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
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



}
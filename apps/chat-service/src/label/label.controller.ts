import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LabelService } from './label.service';
import { CreateLabelDto, DeleteLabelDto, GetPagingLabelDto, UpdateLabelDto } from 'libs/common/dto/label/index.dto';

@Controller()
export class LabelController {
    constructor(private readonly LabelService: LabelService) { }



    @GrpcMethod('LabelService', 'GetPaging')
    async GetPaging(query: GetPagingLabelDto) {
        const result = await this.LabelService.GetPaging(query);
        return {
            code: GrpcStatus.OK,
            message: 'get paging success!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('LabelService', 'Create')
    async Create(dto: CreateLabelDto) {
        const result = await this.LabelService.Create(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Thêm mới thẻ hội thoại thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('LabelService', 'Delete')
    async Delete(dto: DeleteLabelDto) {
        const result = await this.LabelService.Delete(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Xóa thẻ hội thoại thành công!',
            data: JSON.stringify(result),
        };
    }

    @GrpcMethod('LabelService', 'Update')
    async Update(dto: UpdateLabelDto) {
        const result = await this.LabelService.Update(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Cập nhật thẻ hội thoại thành công!',
            data: JSON.stringify(result),
        };
    }

}
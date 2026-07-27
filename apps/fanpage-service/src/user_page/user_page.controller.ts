import { Body, Controller, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserPageService } from './user_page.service';
import { DeleteUserPageDto, GetPagingUserPageDto } from 'libs/common/dto/user_page/index.dto';


@Controller()
export class UserPageController {
    constructor(private readonly userPageService: UserPageService) { }

    @GrpcMethod('UserPageService', 'GetCountProvider')
    async GetCountProvider(dto: any) {
        const data = await this.userPageService.GetCountProvider(dto);
        return {
            code: HttpStatus.OK,
            message: 'get count provider success!',
            data: data

        };
    }

    @GrpcMethod('UserPageService', 'GetPaging')
    async GetPaging(query: any) {
        const result = await this.userPageService.GetPaging(query);
        return {
            code: HttpStatus.OK,
            message: 'get paging success!',
            data: {
                hasMore: result.hasMore,
                pageIndex: result.pageIndex,
                limit: result.limit,
                items: result.data ? result.data : [],
            }
        };
    }

    @GrpcMethod('UserPageService', 'Delete')
    async Delete(param: DeleteUserPageDto) {
        await this.userPageService.Delete(param);
        return {
            code: HttpStatus.OK,
            message: 'delete user pages success!',
        };
    }



}
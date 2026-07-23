import { Body, Controller, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
// import { UsersService } from './users.service';
import { LoginDto } from 'apps/gateway/src/users/dto/login-users.dto';
import { UserPageService } from './user_page.service';


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






}
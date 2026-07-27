import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FanPageService } from './fanpage.service';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { CreateConnectFanPageFacebookDto, TokenRenewalFacebookDto } from 'libs/common/dto/fanpage/index.dto';

@Controller()
export class FanPageController {
    constructor(private readonly FanPageService: FanPageService) { }

    @GrpcMethod('FanPageService', 'CreateConnectPageFacebook')
    async CreateConnectPageFacebook(dto: CreateConnectFanPageFacebookDto) {
        const data = await this.FanPageService.CreateConnectPageFacebook(dto);
        return {
            code: GrpcStatus.OK,
            message: 'create connect page facebook success!',
            data: data
        };
    }

    @GrpcMethod('FanPageService', 'TokenRenewal')
    async TokenRenewal(dto: TokenRenewalFacebookDto) {
        const data = await this.FanPageService.TokenRenewal(dto);
        return {
            code: GrpcStatus.OK,
            message: 'create token success!',
            data: data
        };
    }

    @GrpcMethod('FanPageService', 'GetPageId')
    async GetPageId(param: any) {
        const data = await this.FanPageService.GetPageId(param);
        return {
            code: GrpcStatus.OK,
            message: 'get by id success!',
            data: data
        };
    }

}
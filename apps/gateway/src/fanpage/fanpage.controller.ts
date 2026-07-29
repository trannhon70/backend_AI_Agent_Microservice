// apps/gateway/src/roles/roles.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { FanpageService } from './fanpage.service';
import { CreateConnectFanPageFacebookDto, SyncingDto, TokenRenewalFacebookDto } from 'libs/common/dto/fanpage/index.dto';
@Controller('fanpage-service/fanpages')
export class FanpageController {
    constructor(
        private readonly fanpageService: FanpageService
    ) { }

    @Post('connect-page-facebook')
    @UseGuards(JwtAuthGuard)
    createConnectPageFacebook(@Req() req: any, @Body() body: any) {
        const payload: CreateConnectFanPageFacebookDto = {
            ...body,
            user_id: req.user.id
        }
        return this.fanpageService.createConnectPageFacebook(payload)
    }

    @Post('token-renewal')
    @UseGuards(JwtAuthGuard)
    tokenRenewal(@Req() req: any, @Body() body: any) {

        const payload: TokenRenewalFacebookDto = {
            ...body,
            user_id: req.user.id
        }
        return this.fanpageService.tokenRenewal(payload)
    }

    @Get('get-page-id/:id')
    @UseGuards(JwtAuthGuard)
    async getPageId(@Req() req: any, @Param() param: any) {
        return await this.fanpageService.getPageId(param)
    }

    //đồng bọ tin nhắn
    @Post('syncing')
    @UseGuards(JwtAuthGuard)
    syncing(@Req() req: any, @Body() payload: SyncingDto) {
        return this.fanpageService.syncing(payload)
    }


}
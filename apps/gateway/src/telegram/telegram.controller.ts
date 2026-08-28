// apps/gateway/src/roles/roles.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { TokenRenewalFacebookDto } from 'libs/common/dto/fanpage/index.dto';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { TelegramService } from './telegram.service';
@Controller('fanpage-service/telegram')
export class TelegramController {
    constructor(
        private readonly TelegramService: TelegramService
    ) { }



    @Post('qr')
    @UseGuards(JwtAuthGuard)
    createQrLogin(@Req() req: any, @Body('sessionId') sessionId: string,) {
        const dto = {
            user_id: req.user.id,
            sessionId: sessionId
        }
        return this.TelegramService.createQrLogin(dto);
    }

    @Get('qr-status/:sessionId')
    @UseGuards(JwtAuthGuard)
    getQrStatus(@Param('sessionId') sessionId: string) {
        return this.TelegramService.getQrStatus(sessionId);
    }
    // @Get('get-page-id/:id')
    // @UseGuards(JwtAuthGuard)
    // async getPageId(@Res() res: Response, @Param() param: any) {
    //     const result = await this.fanpageService.getPageId(param);
    //    sendEncryptedResponse(res, result);
    // }



}
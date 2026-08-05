import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { GetPagingMessagesDto } from 'libs/common/dto/messages/index.dto';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { sendEncryptedResponse } from 'libs/common/utils/encrypted-response.util';
import { MessagesService } from './messages.service';

@Controller('chat-service/messages')
export class MessagesController {
    constructor(
        private readonly MessagesService: MessagesService
    ) { }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    async getPaging(@Res() res: Response, @Query() query: GetPagingMessagesDto) {
        const result = await this.MessagesService.getPaging(query);
        sendEncryptedResponse(res, result);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async send(@Req() req: any, @Body() body: any) {
        let attachments = body?.attachments;
        let url = body?.attachments?.[0]?.url;
        return this.MessagesService.send({
            user_id: req.user.id,
            ...body,
            url,
            attachments,
        });
    }

}
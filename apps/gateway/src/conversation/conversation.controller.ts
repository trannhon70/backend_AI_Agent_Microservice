// apps/gateway/src/roles/roles.controller.ts
import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { ConversationService } from './conversation.service';
import { GetPagingConversationDto, updateUnreadCountConversationDto } from 'libs/common/dto/conversation/index.dto';
import type { Response } from 'express';
import { sendEncryptedResponse } from 'libs/common/utils/encrypted-response.util';
@Controller('chat-service/conversation')
export class ConversationController {
    constructor(
        private readonly ConversationService: ConversationService
    ) { }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    async getpaging(@Res() res: Response, @Query() query: GetPagingConversationDto) {
        const result = await this.ConversationService.getPaging(query);
        sendEncryptedResponse(res, result);
    }

    @Post('update-unread-count')
    @UseGuards(JwtAuthGuard)
    async updateUnreadCount(@Body() payload: updateUnreadCountConversationDto) {
        return this.ConversationService.updateUnreadCount(payload);
    }
}
// apps/gateway/src/roles/roles.controller.ts
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { ConversationService } from './conversation.service';
import { GetPagingConversationDto, updateUnreadCountConversationDto } from 'libs/common/dto/conversation/index.dto';
@Controller('chat-service/conversation')
export class ConversationController {
    constructor(
        private readonly ConversationService: ConversationService
    ) { }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    getpaging(@Query() query: GetPagingConversationDto) {
        return this.ConversationService.getPaging(query)
    }

    @Post('update-unread-count')
    @UseGuards(JwtAuthGuard)
    async updateUnreadCount(@Body() payload: updateUnreadCountConversationDto) {
        return this.ConversationService.updateUnreadCount(payload);
    }
}
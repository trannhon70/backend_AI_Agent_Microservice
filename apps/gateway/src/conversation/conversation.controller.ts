// apps/gateway/src/roles/roles.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { ConversationService } from './conversation.service';
import { GetPagingConversationDto } from 'libs/common/dto/conversation/index.dto';
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


}
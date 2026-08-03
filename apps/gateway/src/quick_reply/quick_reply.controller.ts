import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { QuickReplyService } from './quick_reply.service';
import { CreateQuickReplyDto, GetPagingQuickReplyDto, UpdateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';

@Controller('chat-service/quick-reply')
export class QuickReplyController {
    constructor(
        private readonly QuickReplyService: QuickReplyService
    ) { }

    @Post('')
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: CreateQuickReplyDto) {
        const result = await this.QuickReplyService.create(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    async getPaging(@Query() query: GetPagingQuickReplyDto) {
        console.log(query);
        const result = await this.QuickReplyService.getPaging(query);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Put('')
    @UseGuards(JwtAuthGuard)
    async update(@Body() body: UpdateQuickReplyDto) {
        const result = await this.QuickReplyService.update(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

}
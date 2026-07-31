import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';
import { CreateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';

@Controller('chat-service/quick-reply-categories')
export class QuickReplyCategoriesController {
    constructor(
        private readonly QuickReplyCategoriesService: QuickReplyCategoriesService
    ) { }

    @Post('')
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: CreateQuickReplyCategoriesDto) {
        const result = await this.QuickReplyCategoriesService.create(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }


}
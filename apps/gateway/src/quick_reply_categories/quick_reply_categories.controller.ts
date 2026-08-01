import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateQuickReplyCategoriesDto, GetPagingQuickReplyCategoriesDto, UpdateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';

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

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    async getPaging(@Query() query: GetPagingQuickReplyCategoriesDto) {
        const result = await this.QuickReplyCategoriesService.getPaging(query);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param("id") id: number) {
        const result = await this.QuickReplyCategoriesService.delete(id);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Put('')
    @UseGuards(JwtAuthGuard)
    async update(@Body() body: UpdateQuickReplyCategoriesDto) {
        const result = await this.QuickReplyCategoriesService.update(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

}
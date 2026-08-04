import { Body, Controller, Get, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CreateQuickReplyCategoriesDto, GetAllQuickReplyCategoriesDto, GetPagingQuickReplyCategoriesDto, UpdateQuickReplyCategoriesDto } from 'libs/common/dto/quickReplyCategories/index.dto';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { sendEncryptedResponse } from 'libs/common/utils/encrypted-response.util';
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
    async getPaging(@Query() query: GetPagingQuickReplyCategoriesDto, @Res() res: Response) {
        const result = await this.QuickReplyCategoriesService.getPaging(query);
        sendEncryptedResponse(res, {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data),
        });
    }

    @Post('delete')
    @UseGuards(JwtAuthGuard)
    async delete(@Body() body: any) {
        const result = await this.QuickReplyCategoriesService.delete(body);
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

    @Get('get-all')
    @UseGuards(JwtAuthGuard)
    async getAll(@Query() query: GetAllQuickReplyCategoriesDto) {
        const result = await this.QuickReplyCategoriesService.getAll(query);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

}
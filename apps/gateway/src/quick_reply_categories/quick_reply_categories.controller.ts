import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';

@Controller('chat-service/quick-reply-categories')
export class QuickReplyCategoriesController {
    constructor(
        private readonly QuickReplyCategoriesService: QuickReplyCategoriesService
    ) { }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    async getPaging(@Query() query: any) {
        // const result = await this.QuickReplyCategoriesService.getPaging(query);
        // return {
        //     code: result.code,
        //     message: result.message,
        //     data: JSON.parse(result.data)
        // }
    }



}
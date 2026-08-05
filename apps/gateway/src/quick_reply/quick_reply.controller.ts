import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CreateQuickReplyDto, DeleteQuickReplyDto, GetPagingQuickReplyDto, UpdateQuickReplyDto } from 'libs/common/dto/quickReply/index.dto';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { sendEncryptedResponse } from 'libs/common/utils/encrypted-response.util';
import { QuickReplyService } from './quick_reply.service';
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
    async getPaging(@Query() query: GetPagingQuickReplyDto, @Res() res: Response) {
        const result = await this.QuickReplyService.getPaging(query);
        sendEncryptedResponse(res, {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data),
        });
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

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    async delete(@Param() param: DeleteQuickReplyDto) {
        const result = await this.QuickReplyService.delete(param);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Post("delete-all")
    @UseGuards(JwtAuthGuard)
    async deleteAll(@Body() ids: number[]) {
        const result = await this.QuickReplyService.deleteAll({ ids });
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }


}
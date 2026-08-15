import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { LabelService } from './label.service';
import { CopyLabelDto, CreateLabelDto, DeleteLabelDto, GetAllLabelDto, GetPagingLabelDto, UpdateLabelDto } from 'libs/common/dto/label/index.dto';
import type { Response } from 'express';
import { sendEncryptedResponse } from 'libs/common/utils/encrypted-response.util';
@Controller('chat-service/labels')
export class LabelController {
    constructor(
        private readonly LabelService: LabelService
    ) { }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    async getPaging(@Res() res: Response, @Query() query: GetPagingLabelDto) {
        const result = await this.LabelService.getPaging(query);
        sendEncryptedResponse(res, {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data),
        });
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: CreateLabelDto) {
        const result = await this.LabelService.create(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Post("delete")
    @UseGuards(JwtAuthGuard)
    async delete(@Body() body: DeleteLabelDto) {
        const result = await this.LabelService.delete(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Put("")
    @UseGuards(JwtAuthGuard)
    async update(@Body() body: UpdateLabelDto) {
        const result = await this.LabelService.update(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Put("restore/:id")
    @UseGuards(JwtAuthGuard)
    async restore(@Param() param: DeleteLabelDto) {
        const result = await this.LabelService.restore(param);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Post('copy')
    @UseGuards(JwtAuthGuard)
    async copy(@Body() body: CopyLabelDto) {
        const result = await this.LabelService.copy(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Post("delete-all")
    @UseGuards(JwtAuthGuard)
    async deleteAll(@Body() ids: number[]) {
        const result = await this.LabelService.deleteAll({ ids });
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

    @Get('get-all')
    @UseGuards(JwtAuthGuard)
    async getAll(@Res() res: Response, @Query() query: GetAllLabelDto) {
        const result = await this.LabelService.getAll(query);
        sendEncryptedResponse(res, {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data),
        });
    }

}
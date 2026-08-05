// apps/gateway/src/roles/roles.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { UserPageService } from './user_page.service';
import { createUserPageDto, DeleteUserPageDto, getPagingUserPageActiveDto, GetPagingUserPageDto } from 'libs/common/dto/user_page/index.dto';
import { sendEncryptedResponse } from 'libs/common/utils/encrypted-response.util';
import type { Response } from 'express';
@Controller('fanpage-service/user-pages')
export class UserPageController {
    constructor(
        private readonly UserPageService: UserPageService
    ) { }

    @Get('get-count-provider')
    @UseGuards(JwtAuthGuard)
    async getCountProvider(@Res() res: Response, @Req() req: any) {
        const result = await this.UserPageService.getCountProvider(req.user.id);
        sendEncryptedResponse(res, result);
    }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    async getpaging(@Res() res: Response, @Req() req: any, @Query() query: GetPagingUserPageDto) {
        const result = await this.UserPageService.getPaging(req.user.id, query);
        sendEncryptedResponse(res, result);
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    async delete(@Req() req: any, @Param() param: DeleteUserPageDto) {
        return this.UserPageService.delete(param);
    }

    @Get('get-paging-user-page-active')
    @UseGuards(JwtAuthGuard)
    async getPagingUserPageActive(@Res() res: Response, @Query() query: getPagingUserPageActiveDto) {
        const result = await this.UserPageService.getPagingUserPageActive(query);
        sendEncryptedResponse(res, {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data),
        });
    }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createUserPage(@Body() body: createUserPageDto) {
        const result = await this.UserPageService.createUserPage(body);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }

}
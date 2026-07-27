// apps/gateway/src/roles/roles.controller.ts
import { Controller, Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { UserPageService } from './user_page.service';
import { DeleteUserPageDto, GetPagingUserPageDto } from 'libs/common/dto/user_page/index.dto';
@Controller('fanpage-service/user-pages')
export class UserPageController {
    constructor(
        private readonly UserPageService: UserPageService
    ) { }

    @Get('get-count-provider')
    @UseGuards(JwtAuthGuard)
    getCountProvider(@Req() req: any) {
        return this.UserPageService.getCountProvider(req.user.id)
    }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    getpaging(@Req() req: any, @Query() query: GetPagingUserPageDto) {
        return this.UserPageService.getPaging(req.user.id, query)
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    async delete(@Req() req: any, @Param() param: DeleteUserPageDto) {
        return this.UserPageService.delete(param);
    }


}
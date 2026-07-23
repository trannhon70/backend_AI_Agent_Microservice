// apps/gateway/src/roles/roles.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { UserPageService } from './user_page.service';
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

}
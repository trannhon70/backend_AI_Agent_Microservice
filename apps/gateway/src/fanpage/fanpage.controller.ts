// apps/gateway/src/roles/roles.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { FanpageService } from './fanpage.service';
@Controller('fanpage-service/fanpage')
export class FanpageController {
    constructor(
        private readonly fanpageService: FanpageService
    ) { }



    @Get('get-by-id-user')
    @UseGuards(JwtAuthGuard)
    GetByIdUser(@Req() req: any) {

    }

}
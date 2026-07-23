// apps/gateway/src/roles/roles.controller.ts
import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ClientInfo } from 'libs/common/decorators/client-info.decorator';
import { LoginDto } from './dto/login-users.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
@Controller('auth-service/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @Post('login')
    async login(@Body() body: LoginDto, @ClientInfo() option: any, @Res({ passthrough: true }) res: Response) {
        const result: any = await this.usersService.login(body, option);
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true khi chạy HTTPS
            sameSite: 'none' as const,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        return result
    }

    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }
        const result: any = await this.usersService.refresh(refreshToken);
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none' as const,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });

        return { access_token: result.access_token };
    }

    @Get('get-by-id-user')
    @UseGuards(JwtAuthGuard)
    GetByIdUser(@Req() req: any) {
        return this.usersService.GetByIdUser(req.user.id);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: any) {
        return this.usersService.logout(req.user.id);
    }
}
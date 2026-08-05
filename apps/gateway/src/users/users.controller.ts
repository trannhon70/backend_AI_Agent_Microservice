// apps/gateway/src/roles/roles.controller.ts
import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClientInfo } from 'libs/common/decorators/client-info.decorator';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { sendEncryptedResponse } from 'libs/common/utils/encrypted-response.util';
import { LoginDto, LoginV1Dto } from '../../../../libs/common/dto/user/login-users.dto';
import { UsersService } from './users.service';
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
    async GetByIdUser(@Res() res: Response, @Req() req: any) {
        const result = await this.usersService.GetByIdUser(req.user.id);
        sendEncryptedResponse(res, result);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: any) {
        return this.usersService.logout(req.user.id);
    }

    @Post('login-v1')
    async loginV1(@Body() body: LoginV1Dto, @Res({ passthrough: true }) res: Response) {
        const result = await this.usersService.loginV1(body);
        res.cookie('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true khi chạy HTTPS
            sameSite: 'none' as const,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });
        return result
    }
}
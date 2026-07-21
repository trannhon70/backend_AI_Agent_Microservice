// apps/gateway/src/roles/roles.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ClientInfo } from 'libs/common/decorators/client-info.decorator';
import { LoginDto } from './dto/login-users.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @Post('login')
    login(@Body() body: LoginDto, @ClientInfo() option: any) {
        return this.usersService.login(body, option);
    }
}
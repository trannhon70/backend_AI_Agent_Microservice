import { Body, Controller, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { LoginDto } from 'apps/gateway/src/users/dto/login-users.dto';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @GrpcMethod('AuthService', 'Login')
    async login(dto: LoginDto) {
        const data = await this.usersService.login(dto);
        return {
            code: HttpStatus.OK,
            message: 'Đăng nhập thành công!',
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: data.user,
            startTime: data.startTime,
            endTime: data.endTime
        };
    }


}
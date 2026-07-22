import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import type { ClientGrpc } from '@nestjs/microservices';
import { LoginDto } from './dto/login-users.dto';

interface UsersGrpcService {
    Login(data: LoginDto): any;
}

@Injectable()
export class UsersService implements OnModuleInit {
    private usersGrpcService!: UsersGrpcService;

    constructor(@Inject('auth') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.usersGrpcService = this.client.getService<UsersGrpcService>('AuthService');
    }

    async login(dto: LoginDto, option: any) {
        return firstValueFrom(this.usersGrpcService.Login(dto));
    }

}
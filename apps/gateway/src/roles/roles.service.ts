// apps/gateway/src/roles/roles.service.ts
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import type { ClientGrpc } from '@nestjs/microservices';

interface RolesGrpcService {
    create(data: CreateRoleDto): any;
    update(data: UpdateRoleDto & { id: number }): any;
    FindAll(data: {}): any;
}

@Injectable()
export class RolesService implements OnModuleInit {
    private rolesGrpcService!: RolesGrpcService;

    constructor(@Inject('auth') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.rolesGrpcService = this.client.getService<RolesGrpcService>('RolesService');
    }

    async create(dto: CreateRoleDto) {
        return firstValueFrom(this.rolesGrpcService.create(dto) as any);
    }

    async update(id: number, dto: UpdateRoleDto) {
        return firstValueFrom(this.rolesGrpcService.update({ ...dto, id }) as any);
    }

    async findAll() {
        return firstValueFrom(this.rolesGrpcService.FindAll({}) as any);
    }
}
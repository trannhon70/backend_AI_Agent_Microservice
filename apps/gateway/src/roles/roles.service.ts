// apps/gateway/src/roles/roles.service.ts
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { CreateRoleDto } from 'libs/common/dto/role/create-role.dto';
import { UpdateRoleDto } from 'libs/common/dto/role/update-role.dto';

interface RolesGrpcService {
    create(data: CreateRoleDto): any;
    update(data: UpdateRoleDto & { id: number }): any;
    findAll(data: {}): any;
}

@Injectable()
export class RolesService implements OnModuleInit {
    private rolesGrpcService!: RolesGrpcService;

    constructor(@Inject('auth') private readonly client: ClientGrpc) { }

    onModuleInit() {
        this.rolesGrpcService = this.client.getService<RolesGrpcService>('RolesService');
    }

    async create(dto: CreateRoleDto) {
        return firstValueFrom(this.rolesGrpcService.create(dto));
    }

    async update(id: number, dto: UpdateRoleDto) {
        return firstValueFrom(this.rolesGrpcService.update({ ...dto, id }) as any);
    }

    async findAll() {
        return firstValueFrom(this.rolesGrpcService.findAll({}) as any);
    }
}
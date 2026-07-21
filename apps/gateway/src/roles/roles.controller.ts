// apps/gateway/src/roles/roles.controller.ts
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Roles } from 'libs/common/decorators/roles.decorator';
import { RoleEnum } from 'libs/common/enums/role.enum';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';

@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService
    ) { }

    @Get()
    // @UseGuards(JwtAuthGuard)
    // @Roles(RoleEnum.OWNER, RoleEnum.ADMIN_MANAGE)
    findAll() {
        return this.rolesService.findAll();
    }

    @Post()
    @Roles(RoleEnum.OWNER)
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.create(dto);
    }

    @Put(':id')
    @Roles(RoleEnum.OWNER, RoleEnum.ADMIN_MANAGE)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
        return this.rolesService.update(id, dto);
    }
}
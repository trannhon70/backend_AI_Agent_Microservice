// apps/gateway/src/roles/roles.controller.ts
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Roles } from 'libs/common/decorators/roles.decorator';
import { RoleEnum } from 'libs/common/enums/role.enum';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { CreateRoleDto } from 'libs/common/dto/role/create-role.dto';
import { UpdateRoleDto } from 'libs/common/dto/role/update-role.dto';

@Controller('auth-service/roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService
    ) { }

    @Get('get-all')
    @UseGuards(JwtAuthGuard)
    @Roles(RoleEnum.OWNER)
    findAll() {
        return this.rolesService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @Roles(RoleEnum.OWNER)
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @Roles(RoleEnum.OWNER)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
        return this.rolesService.update(id, dto);
    }
}
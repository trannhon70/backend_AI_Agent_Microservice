import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from '@app/database/entities/role.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
  ],
  providers: [RolesService, RoleRepository],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule { }

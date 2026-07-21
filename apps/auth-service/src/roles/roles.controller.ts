import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';
import { GrpcMethod } from '@nestjs/microservices';


@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @GrpcMethod('RolesService', 'FindAll')
  async findAll() {
    const roles = await this.rolesService.findAll();
    return { roles };
  }


}

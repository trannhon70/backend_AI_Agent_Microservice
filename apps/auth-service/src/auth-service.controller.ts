import { Controller, Get } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) { }

  @Get()
  getHello(): string {
    return this.authServiceService.getHello();
  }

  @GrpcMethod('AuthService', 'Create')
  create(data: { name: string }) {

    console.log(data);

    return {

      message: `Hello ${data.name}`,

    };

  }
}

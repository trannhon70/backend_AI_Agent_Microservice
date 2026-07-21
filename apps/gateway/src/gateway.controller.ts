import { Controller, Get } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { lastValueFrom } from 'rxjs';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) { }

  @Get()
  async hello() {

    return await lastValueFrom(

      this.gatewayService.Create("Nhơn")

    );

  }
}

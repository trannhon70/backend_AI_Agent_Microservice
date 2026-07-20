import { Controller, Get } from '@nestjs/common';
import { FanpageServiceService } from './fanpage-service.service';

@Controller()
export class FanpageServiceController {
  constructor(private readonly fanpageServiceService: FanpageServiceService) {}

  @Get()
  getHello(): string {
    return this.fanpageServiceService.getHello();
  }
}

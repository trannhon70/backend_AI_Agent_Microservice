import { Module } from '@nestjs/common';
import { FanpageServiceController } from './fanpage-service.controller';
import { FanpageServiceService } from './fanpage-service.service';

@Module({
  imports: [],
  controllers: [FanpageServiceController],
  providers: [FanpageServiceService],
})
export class FanpageServiceModule {}

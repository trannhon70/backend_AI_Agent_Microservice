import { Module } from '@nestjs/common';
import { FanpageController } from './fanpage.controller';
import { FanpageService } from './fanpage.service';

@Module({
    controllers: [FanpageController],
    providers: [FanpageService],
})
export class FanpageModule { }
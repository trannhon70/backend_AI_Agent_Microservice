import { Module } from '@nestjs/common';
import { FanpageController } from './fanpage.controller';
import { FanpageService } from './fanpage.service';
import { FanpageSyncListener } from './fanpages.listener';

@Module({
    controllers: [FanpageController, FanpageSyncListener],
    providers: [FanpageService],
})
export class FanpageModule { }
import { Module } from '@nestjs/common';

import { QuickReplyCategoriesController } from './quick_reply_categories.controller';
import { QuickReplyCategoriesService } from './quick_reply_categories.service';

@Module({
    controllers: [QuickReplyCategoriesController],
    providers: [QuickReplyCategoriesService],
})

export class QuickReplyCategoriesModule { }
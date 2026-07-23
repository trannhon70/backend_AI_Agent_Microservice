import { Module } from '@nestjs/common';

import { UserPageController } from './user_page.controller';
import { UserPageService } from './user_page.service';

@Module({
    controllers: [UserPageController],
    providers: [UserPageService],
})
export class UserPageModule { }
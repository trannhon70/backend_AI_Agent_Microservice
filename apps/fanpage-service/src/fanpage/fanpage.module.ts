import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPage } from '@app/database/entities/user_page.entity';

import { User } from '@app/database/entities/user.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { Role } from '@app/database/entities/role.entity';
import { FanPageController } from './fanpage.controller';
import { FanPageService } from './fanpage.service';
import { PageToken } from '@app/database/entities/page_token.entity';
import { FanPagesRepository } from './fanpages.repository';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { Conversation } from '@app/database/entities/conversation.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserPage, User, Fanpage, Role, PageToken, LiveMessage, Conversation]),
    ],
    providers: [FanPageService, FanPagesRepository],
    controllers: [FanPageController],
    exports: [FanPageService],
})
export class FanPageModule { }
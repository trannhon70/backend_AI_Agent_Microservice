import { UserPage } from '@app/database/entities/user_page.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { PageToken } from '@app/database/entities/page_token.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserPage, User, Fanpage, Role, PageToken, LiveMessage, Conversation]),

    ],
    providers: [TelegramService],
    controllers: [TelegramController],
    exports: [TelegramService],
})
export class TelegramModule { }
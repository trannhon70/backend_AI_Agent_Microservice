import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { Label } from '@app/database/entities/label.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuickReplyCategoriesController } from './quickReplyCategories.controller';
import { QuickReplyCategoriesService } from './quickReplyCategories.service';
import { QuickReplyCategory } from '@app/database/entities/quick_reply_category.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, LiveMessage, User, Role, Label, Fanpage, QuickReplyCategory]),
    ],
    providers: [QuickReplyCategoriesService,],
    controllers: [QuickReplyCategoriesController],
    exports: [QuickReplyCategoriesService],
})
export class QuickReplyCategoriesModule { }
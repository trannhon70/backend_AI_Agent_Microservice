import { Conversation } from '@app/database/entities/conversation.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PageToken } from '@app/database/entities/page_token.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, LiveMessage, User, Role, PageToken, Fanpage]),
    ],
    providers: [MessagesService],
    controllers: [MessagesController],
    exports: [MessagesService],
})
export class MessagesModule { }
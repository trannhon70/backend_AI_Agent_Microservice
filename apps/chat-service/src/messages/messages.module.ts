import { Conversation } from '@app/database/entities/conversation.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, LiveMessage, User, Role]),
    ],
    providers: [MessagesService],
    controllers: [MessagesController],
    exports: [MessagesService],
})
export class MessagesModule { }
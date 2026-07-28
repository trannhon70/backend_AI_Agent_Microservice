import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from '@app/database/entities/conversation.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { User } from '@app/database/entities/user.entity';
import { Role } from '@app/database/entities/role.entity';
import { ConversationsRepository } from './conversations.repository';


@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, LiveMessage, User, Role]),
    ],
    controllers: [ConversationController],
    providers: [ConversationService, ConversationsRepository,],
    exports: [
        ConversationService,
        ConversationsRepository,
    ],
})
export class ConversationModule { }
import { Conversation } from '@app/database/entities/conversation.entity';
import { Label } from '@app/database/entities/label.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelController } from './label.controller';
import { LabelService } from './label.service';
import { Fanpage } from '@app/database/entities/fanpage.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, LiveMessage, User, Role, Label, Fanpage]),
    ],
    providers: [LabelService],
    controllers: [LabelController],
    exports: [LabelService],
})
export class LabelModule { }
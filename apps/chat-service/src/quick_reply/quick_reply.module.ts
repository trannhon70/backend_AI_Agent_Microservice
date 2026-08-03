import { QuickReply } from '@app/database/entities/quick_reply.entity';
import { QuickReplyCategory } from '@app/database/entities/quick_reply_category.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuickReplyController } from './quick_reply.controller';
import { QuickReplyService } from './quick_reply.service';
import { Fanpage } from '@app/database/entities/fanpage.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([QuickReplyCategory, QuickReply, Fanpage]),
    ],
    providers: [QuickReplyService],
    controllers: [QuickReplyController],
    exports: [QuickReplyService],
})
export class QuickReplyModule { }
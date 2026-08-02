import { Module } from '@nestjs/common';
import { QuickReplyController } from './quick_reply.controller';
import { QuickReplyService } from './quick_reply.service';


@Module({
    controllers: [QuickReplyController],
    providers: [QuickReplyService],
})

export class QuickReplyModule { }
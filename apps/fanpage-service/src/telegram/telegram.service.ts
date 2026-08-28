import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { PageToken } from '@app/database/entities/page_token.entity';
import { UserPage } from '@app/database/entities/user_page.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RedisService } from 'libs/redis/redis.service';
import { FanPagesRepository } from '../fanpage/fanpages.repository';
import { currentTimestamp } from 'libs/common/utils/date.util';
const ONE_DAY = 24 * 60 * 60;

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    constructor(

        @InjectRepository(UserPage)
        private UserPageRepo: Repository<UserPage>,

        @InjectRepository(Fanpage)
        private readonly fanpageRepo: Repository<Fanpage>,

        @InjectRepository(PageToken)
        private readonly pageTokenRepo: Repository<PageToken>,

        @InjectRepository(UserPage)
        private readonly userPageRepo: Repository<UserPage>,


        @InjectRepository(Conversation)
        private readonly conversationRepo: Repository<Conversation>,

        @InjectRepository(LiveMessage)
        private readonly liveMessageRepo: Repository<LiveMessage>,


        private readonly redisService: RedisService,
    ) { }

    async ConnectPageTelegram(dto: any) {
        const { id, accessHash, username, firstName, phone, premium, bot, user_id, sessionId } = dto;
        const data_fanpage = {
            user_id: user_id,
            page_id: id,
            page_name: firstName,
            access_token: sessionId,
            page_platform: 'telegram',
            created_at: currentTimestamp(),
        }
        return this.fanpageRepo.save(data_fanpage)
    }

}
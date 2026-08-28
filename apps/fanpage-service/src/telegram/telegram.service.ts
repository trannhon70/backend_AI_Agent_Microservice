import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { PageToken } from '@app/database/entities/page_token.entity';
import { UserPage } from '@app/database/entities/user_page.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProviderEnum, RoleEnumUserPage } from 'libs/common/enums/role.enum';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { RedisService } from 'libs/redis/redis.service';
import { Repository } from 'typeorm';
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
        let page: any = await this.fanpageRepo.findOne({
            where: { page_id: id },
        });

        if (!page) {
            page = await this.fanpageRepo.save({          // ← đổi create → save
                user_id: user_id,
                page_id: id,
                page_name: firstName,
                access_token: sessionId,
                page_platform: 'telegram',
                created_at: currentTimestamp(),
            });
            // page.id giờ đã có giá trị thật từ DB

            await this.pageTokenRepo.save({
                fanpage_id: page.id,
                access_token: sessionId,
                created_at: currentTimestamp(),
            });
        }

        // Update lại thông tin page
        await this.fanpageRepo.update(
            { id: page.id },
            {
                page_name: firstName,
                access_token: sessionId,
            },
        );

        await this.pageTokenRepo.update({ fanpage_id: page.id }, {
            access_token: sessionId,
        });

        await this.userPageRepo.upsert({
            user_id: user_id,
            fanpage_id: page.id,
            provider: ProviderEnum.TELEGRAM,
            role: RoleEnumUserPage.ADMIN_MANAGE,
            created_at: currentTimestamp(),
        }, { conflictPaths: ["user_id", "fanpage_id"] });

        return;
    }

}
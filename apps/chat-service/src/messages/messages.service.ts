import { Conversation } from '@app/database/entities/conversation.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { PageToken } from '@app/database/entities/page_token.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetPagingMessagesDto } from 'libs/common/dto/messages/index.dto';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { DataSource, Repository } from 'typeorm';
import axios from 'axios';
@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);
    constructor(
        @InjectRepository(LiveMessage)
        private liveMessageRepo: Repository<LiveMessage>,

        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,

        @InjectRepository(PageToken)
        private readonly pageTokenRepo: Repository<PageToken>,

        @InjectRepository(Fanpage)
        private readonly fanpageRepo: Repository<Fanpage>,
        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,
    ) {
    }


    async GetPaging(query: GetPagingMessagesDto) {
        const { conversation_id, limit, pageIndex, search } = query

        const skip = (pageIndex - 1) * limit;
        const qb = this.liveMessageRepo.createQueryBuilder('message')
            .innerJoin('message.conversation', 'conversation')
            .leftJoin('message.user', 'user')
            .leftJoin('message.reply_to', 'replyMessage')
            .select([
                'message.id',
                'message.reply_to_id',
                'message.facebook_mid',
                'message.conversation_id',
                'message.direction',
                'message.type',
                'message.text',
                'message.attachments',
                'message.user_id',
                'message.sent_at',
                'message.created_at',

                'conversation.id',
                'conversation.full_name',
                'conversation.avatar',

                'user.id',
                'user.full_name',
                'user.avatar',

                // Message được reply
                'replyMessage.id',
                'replyMessage.conversation_id',
                'replyMessage.direction',
                'replyMessage.type',
                'replyMessage.text',
                'replyMessage.attachments',
                'replyMessage.user_id',
                'replyMessage.sent_at',
                'replyMessage.created_at',

            ])
            .where('message.conversation_id = :conversation_id', { conversation_id })
            .orderBy('message.sent_at', 'DESC').addOrderBy('message.id', 'DESC')
            .skip(skip)
            .take(limit + 1);

        if (search) {
            qb.andWhere(
                `message.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`,
                { search },
            );
        }

        const result = await qb.getMany();
        // result.length > limit tức là còn dữ liệu, hasMore = true, còn lại thì false
        const hasMore = result.length > limit;

        return {
            pageIndex: pageIndex,
            limit: limit,
            hasMore: hasMore,
            data: result.slice(0, limit).reverse(),
        };

    }

    async Send(dto: any) {
        const payload = JSON.parse(dto.data);
        const accessToken = await this.getAccessToken(payload.page_id);

        if (!accessToken) {
            this.logger.error(`No access token for page ${payload.page_id}`);
            return;
        }

        const message = this.buildFacebookMessage(payload);

        const fbMessageId = await this.sendToFacebook(
            payload.customer_id,
            accessToken,
            message,
            payload.conversation_id,
        );

        if (!fbMessageId) return;

        await this.saveMessage(payload, fbMessageId);
    }

    private async getAccessToken(pageId: string): Promise<string | null> {
        const fanpage = await this.fanpageRepo
            .createQueryBuilder('fanpage')
            .select('fanpage.id', 'id')
            .where('fanpage.page_id = :pageId', { pageId })
            .getRawOne();

        if (!fanpage) return null;

        const token = await this.pageTokenRepo
            .createQueryBuilder('pageToken')
            .select('pageToken.access_token', 'access_token')
            .where('pageToken.fanpage_id = :id', { id: fanpage.id })
            .getRawOne();

        return token?.access_token ?? null;
    }

    private buildFacebookMessage(payload: any) {
        if (payload.text) {
            return {
                text: payload.text,
            };
        }

        return {
            attachment: {
                type: payload.type,
                payload: {
                    url: payload.url,
                    is_reusable: true,
                },
            },
        };
    }

    private async sendToFacebook(
        customerId: string,
        accessToken: string,
        message: any,
        conversationId: number,
    ) {
        try {
            const res = await axios.post(
                'https://graph.facebook.com/v23.0/me/messages',
                {
                    recipient: {
                        id: customerId,
                    },
                    message,
                },
                {
                    params: {
                        access_token: accessToken,
                    },
                    timeout: 10000,
                },
            );

            return res.data.message_id;
        } catch (err) {
            this.logger.error(
                `Failed to send FB message conversation ${conversationId}`,
                err,
            );
            return null;
        }
    }

    private async saveMessage(payload: any, facebookMid: string) {
        try {
            const savedMessage = await this.liveMessageRepo.save({
                conversation_id: payload.conversation_id,
                sender_id: payload.customer_id,
                recipient_id: payload.page_id,
                direction: payload.direction,
                type: payload.type,
                text: payload.text,
                attachments: payload.attachments,
                user_id: payload.user_id,
                facebook_mid: facebookMid,
                reply_to_id: payload?.reply_to?.facebook_mid ?? null,
                sent_at: currentTimestamp(),
                created_at: currentTimestamp(),
            });
            await this.conversationRepo.update(payload.conversation_id, {
                last_message_id: savedMessage.id ?? '[Attachment]',
                last_message_at: currentTimestamp(),
                updated_at: currentTimestamp(),
            })

        } catch (err) {
            this.logger.error(
                `FB message sent but save DB failed ${payload.conversation_id}`,
                err,
            );
        }
    }
}
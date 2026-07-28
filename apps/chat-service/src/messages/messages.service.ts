import { Conversation } from '@app/database/entities/conversation.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetPagingMessagesDto } from 'libs/common/dto/messages/index.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MessagesService {

    constructor(
        @InjectRepository(LiveMessage)
        private liveMessageRepo: Repository<LiveMessage>,

        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,
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


}
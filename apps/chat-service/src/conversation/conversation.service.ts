import { Conversation } from '@app/database/entities/conversation.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addLabelToConversationDto, GetPagingConversationDto } from 'libs/common/dto/conversation/index.dto';
import { MessageDirection, MessageType } from 'libs/common/enums/role.enum';
import { normalizeAttachments } from 'libs/common/utils';
import { currentTimestamp } from 'libs/common/utils/date.util';
import { DataSource, Repository } from 'typeorm';
// import { RoleRepository } from './role.repository';

@Injectable()
export class ConversationService {

    constructor(
        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,

        @InjectRepository(LiveMessage)
        private readonly LiveMessageRepo: Repository<LiveMessage>,
        // private readonly roleRepo: RoleRepository,
        private readonly dataSource: DataSource,

    ) {
    }


    async GetPaging(query: GetPagingConversationDto) {
        const { page_id, limit, pageIndex, search } = query

        const qb = this.conversationRepo
            .createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
            .where('conversation.page_id = :page_id', { page_id });

        if (search?.trim()) {
            qb.addSelect(`ts_rank_cd(conversation.search_vector, websearch_to_tsquery('simple', unaccent(:search)))`, 'rank')
                .andWhere(`conversation.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`, { search: search.trim() })
                .orderBy('rank', 'DESC')
                .addOrderBy('conversation.created_at', 'DESC')
                .addOrderBy('conversation.id', 'DESC');
        } else {
            qb.orderBy('conversation.created_at', 'DESC').addOrderBy('conversation.id', 'DESC');
        }

        qb.skip((pageIndex - 1) * limit).take(limit + 1);
        const result = await qb.getMany();
        const hasMore = result.length > limit;

        return {
            pageIndex: pageIndex,
            limit: limit,
            hasMore: hasMore,
            data: result.slice(0, limit).reverse(),
        };
    }

    async findOrCreateConversation(
        pageId: string,
        customerId: string,
    ) {
        await this.conversationRepo.upsert(
            {
                page_id: pageId,
                customer_id: customerId,
                created_at: currentTimestamp(),
                updated_at: currentTimestamp(),
            },
            {
                conflictPaths: ['page_id', 'customer_id'],
                skipUpdateIfNoValuesChanged: true,
            },
        );

        return await this.conversationRepo.findOneOrFail({
            where: {
                page_id: pageId,
                customer_id: customerId,
            },
        });
    }

    async FacebookSend(body: any) {
        const payload = JSON.parse(body);
        for (const entry of payload) {
            const pageId = entry.id;
            for (const event of entry.messaging) {
                if (!event.message) {
                    continue;
                }
                const sender_id = event.sender.id;
                const recipient_id = event.recipient.id;
                let type = MessageType.TEXT;

                if (event.message.attachments?.length) {
                    const attachment = event.message.attachments[0];

                    if (attachment.type?.startsWith("image")) {
                        type = MessageType.IMAGE;
                    } else if (attachment.type?.startsWith("video")) {
                        type = MessageType.VIDEO;
                    } else if (attachment.type?.startsWith("audio")) {
                        type = MessageType.AUDIO;
                    } else {
                        type = MessageType.FILE;
                    }
                }

                const conversation = await this.findOrCreateConversation(pageId, sender_id);
                const data_mess = {
                    conversation_id: conversation.id,
                    facebook_mid: event.message.mid,
                    reply_to_id: event.message?.reply_to?.mid ?? null,
                    sender_id: sender_id,
                    recipient_id: recipient_id,
                    direction: MessageDirection.CUSTOMER,
                    type: type,
                    text: event.message.text,
                    attachments: normalizeAttachments(event.message.attachments, 'webhook'),
                    raw_data: event,
                    sent_at: currentTimestamp(),
                    created_at: currentTimestamp(),
                }
                const savedMessage = await this.LiveMessageRepo.save(data_mess);

                // update conversation
                await this.conversationRepo.update(
                    conversation.id,
                    {
                        last_message_id: savedMessage.id ?? '[Attachment]',
                        last_message_at: currentTimestamp(),
                        updated_at: currentTimestamp(),
                        unread_count: () => `"unread_count" + 1`,
                    },
                );
                const updatedConversation = await this.conversationRepo.findOne({
                    where: {
                        id: conversation.id,
                    },
                    relations: { lastMessage: true },
                });
                // lưu message và thực hiện socket
                return { page_id: pageId, conversation_id: conversation.id, message: data_mess, conversation: updatedConversation }
            }
        }


    }

    async UpdateUnreadCount(body: any) {
        const payload = JSON.parse(body);
        const { conversation_id, unread_count } = payload;
        await this.conversationRepo.update(
            conversation_id,
            {
                unread_count: unread_count,
                updated_at: currentTimestamp(),
            },
        );
        return payload
    }

    async AddLabelToConversation(dto: addLabelToConversationDto) {
        const { id, label_id, page_id } = dto;
        await this.conversationRepo
            .createQueryBuilder()
            .relation(Conversation, 'labels')
            .of(id)
            .add(label_id);

        return {
            success: true,
            message: 'Thêm label vào conversation thành công',
        };
        // const
    }

}
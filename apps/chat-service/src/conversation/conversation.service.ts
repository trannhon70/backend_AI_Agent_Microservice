import { Conversation } from '@app/database/entities/conversation.entity';
import { LiveMessage } from '@app/database/entities/live_message.entity';
import { SocketService } from '@app/socket';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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


    async GetPaging(query: any) {
        const limit = query.limit ? parseInt(query.limit as any, 10) : 10;
        const search = query.search?.trim() || '';
        const page_id = query.page_id || '';
        const lastId = query.lastId ? Number(query.lastId) : undefined;
        const lastUpdatedAt = query.lastUpdatedAt || undefined;

        const qb = this.conversationRepo
            .createQueryBuilder('conversation')
            .select([
                'conversation.id',
                'conversation.page_id',
                'conversation.full_name',
                'conversation.updated_at',
                'conversation.last_message_at',
                'conversation.unread_count',
                'conversation.customer_id',
            ])
            .where('conversation.page_id = :page_id', { page_id });

        if (search) {
            qb.andWhere(
                `conversation.search_vector @@ websearch_to_tsquery('simple', unaccent(:search))`,
                { search },
            );
        }

        if (lastId && lastUpdatedAt) {
            qb.andWhere(
                '(conversation.updated_at, conversation.id) < (:lastUpdatedAt, :lastId)',
                { lastUpdatedAt, lastId },
            );
        }

        qb.leftJoin('conversation.lastMessage', 'lastMessage')
            .addSelect(['lastMessage.id', 'lastMessage.text', 'lastMessage.type'])
            .orderBy('conversation.updated_at', 'DESC')
            .addOrderBy('conversation.id', 'DESC')
            .take(limit);

        const result = await qb.getMany();
        const last = result[result.length - 1];

        return {
            limit,
            hasMore: result.length === limit,
            lastId: last?.id ?? 0,
            lastUpdatedAt: last?.updated_at ?? 0,
            data: result.map((c) => ({
                id: c.id,
                page_id: c.page_id ?? '',
                full_name: c.full_name ?? '',
                updated_at: c.updated_at ?? 0,
                last_message_at: c.last_message_at ?? 0,
                unread_count: c.unread_count ?? 0,
                customer_id: c.customer_id ?? '',
                lastMessage: c.lastMessage
                    ? {
                        id: c.lastMessage.id,
                        text: c.lastMessage.text ?? '',
                        type: c.lastMessage.type ?? '',
                    }
                    : { id: 0, text: '', type: '' },
            })),
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



}
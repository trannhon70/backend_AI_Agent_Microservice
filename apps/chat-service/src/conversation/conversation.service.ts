import { Conversation } from '@app/database/entities/conversation.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
// import { RoleRepository } from './role.repository';

@Injectable()
export class ConversationService {

    constructor(
        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,
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



}
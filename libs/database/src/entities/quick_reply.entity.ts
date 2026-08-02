import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Fanpage } from './fanpage.entity';
import { QuickReplyCategory } from './quick_reply_category.entity';

@Entity('quick_reply')
@Index('idx_QuickReply_created_at_id', ['quick_reply_category_id', 'created_at', 'id'])
export class QuickReply {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ type: 'text', nullable: true })
    content!: string | null;

    @Column({ nullable: true })
    quick_reply_category_id!: number | null;

    @ManyToOne(() => QuickReplyCategory, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'quick_reply_category_id' })
    quickReplyCategory!: QuickReplyCategory | null;

    @Column({ type: 'tsvector', select: false, nullable: true })
    search_vector!: string;

    @Column({ type: 'float', nullable: true })
    created_at!: number | null;
}

import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Fanpage } from './fanpage.entity';

@Entity('quick_reply_category')
@Unique('uq_QuickReplyCategor_fanpage_id_name', ['fanpage_id', 'name'])
@Index('idx_QuickReplyCategor_created_at_id', ['fanpage_id', 'created_at', 'id'])
export class QuickReplyCategory {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ type: 'varchar', nullable: true })
    name!: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    color!: string | null;

    @Column({ nullable: true })
    fanpage_id!: number | null;

    @ManyToOne(() => Fanpage, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'fanpage_id' })
    fanpage!: Fanpage | null;

    @Column({ type: 'tsvector', select: false, nullable: true })
    search_vector!: string;

    @Column({ type: 'float', nullable: true })
    created_at!: number | null;
}

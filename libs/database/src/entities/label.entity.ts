
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Fanpage } from "./fanpage.entity";

@Entity('labels')
@Unique('uq_labels_fanpage_id_name', ['fanpage_id', 'name'])
@Index('idx_labels_fanpage_created_at_id', ['fanpage_id', 'is_deleted', 'created_at', 'id'])
export class Label {
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

    // false: đang được sử dụng, true: ngưng sử dụng
    @Column({ default: false })
    is_deleted!: boolean;

    @Column({ type: 'tsvector', select: false, nullable: true })
    search_vector!: string;

    @Column({ type: 'float', nullable: true })
    created_at!: number | null;
}

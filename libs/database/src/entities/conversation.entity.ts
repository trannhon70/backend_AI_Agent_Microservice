import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.entity";
import { LiveMessage } from "./live_message.entity";

@Entity('conversations')
@Unique(['page_id', 'customer_id'])

export class Conversation {
    @PrimaryGeneratedColumn()
    id!: number;

    // Nhân viên đảm nhận chat
    @Column({ nullable: true })
    assigned_user_id!: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assigned_user_id' })
    assignedUser!: User | null;

    // 💬 messages
    @OneToMany(() => LiveMessage, (message) => message.conversation)
    messages!: LiveMessage[];

    //hội thoại này thuộc Facebook Page nào
    @Column({ nullable: true })
    page_id!: string;

    //khách hàng đang nhắn tin
    @Column({ nullable: true })
    customer_id!: string;

    //tên khách hàng
    @Column({ nullable: true })
    full_name!: string;

    // last_message tin nhắn mới nhất
    @Column({ nullable: true })
    last_message_id!: number | null;

    @ManyToOne(() => LiveMessage, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'last_message_id' })
    lastMessage!: LiveMessage | null;

    @Column({ type: 'float', nullable: true })
    last_message_at!: number | null;

    //Số tin nhắn chưa đọc từ phía khách hàng gửi vào
    @Column({ nullable: true, default: 0 })
    unread_count!: number;

    //hình ảnh 
    @Column({ nullable: true, type: "text" })
    avatar!: string;

    //Thời điểm cuộc hội thoại được tạo lần đầu
    @Column({ type: 'float', nullable: true })
    created_at!: number | null;

    @Column({ type: 'tsvector', select: false, nullable: true })
    search_vector!: string;

    //Thời điểm cuộc hội thoại được tạo lần đầu
    @Column({ type: 'float', nullable: true })
    updated_at!: number | null;
}

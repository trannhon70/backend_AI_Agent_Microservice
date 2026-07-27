import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, Index,
    OneToMany
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { MessageDirection, MessageType } from 'libs/common/enums/role.enum';
import { NormalizedAttachment } from 'libs/common/interfaces';
import { User } from './user.entity';

@Entity('live_messages')
export class LiveMessage {

    @PrimaryGeneratedColumn()
    id!: number;

    // 🔗 Conversation
    @Column({ name: 'conversation_id' })
    conversation_id!: number;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    // 🔑 Facebook Message ID - tránh duplicate
    @Column({
        type: 'varchar',
        name: 'facebook_mid',
        nullable: true,
        unique: true,
    })
    facebook_mid!: string | null;

    // 👤 sender & recipient (PSID hoặc Page ID)
    @Column({ name: 'sender_id' })
    sender_id!: string;

    @Column({ name: 'recipient_id' })
    recipient_id!: string;

    // ↔️ Chiều tin nhắn
    @Column({
        type: 'enum',
        enum: MessageDirection,
        default: MessageDirection.AUTO,
    })
    direction!: MessageDirection;

    // 📌 Loại tin nhắn
    @Column({
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT,
    })
    type!: MessageType;

    // 💬 Nội dung text
    @Column({ type: 'text', nullable: true })
    text!: string | null;

    // 📎 Attachments (image, file, audio...)
    @Column({ type: 'jsonb', nullable: true })
    attachments!: NormalizedAttachment[];

    // 🗃 Raw payload từ Facebook webhook - để debug
    @Column({ type: 'jsonb', nullable: true })
    raw_data!: object | null;

    // 👤 Agent gửi (nếu outbound)
    @Column({ name: 'user_id', nullable: true })
    user_id!: number | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user!: User | null;

    // ⏱ Thời gian khách gửi (từ Facebook timestamp)
    @Column({ type: 'float', nullable: true })
    sent_at!: number | null;

    // ⏱ Thời gian lưu vào DB
    @Column({ type: 'float', nullable: true })
    created_at!: number | null;

    // Reply message
    @Column({
        type: 'varchar',
        nullable: true,
    })
    reply_to_id!: string | null;

    @ManyToOne(() => LiveMessage, (message) => message.replies, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({
        name: 'reply_to_id',
        referencedColumnName: 'facebook_mid',
    })
    reply_to!: LiveMessage | null;

    @OneToMany(() => LiveMessage, (message) => message.reply_to)
    replies!: LiveMessage[];
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { Role } from './role.entity';
import { ProviderEnum } from 'libs/common/enums/role.enum';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    role_id!: number;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @Column({ nullable: true })
    email!: string;

    @Column({ nullable: true })
    password!: string;

    @Column({ nullable: true })
    full_name!: string;

    @Column({ nullable: true })
    ngay_sinh!: string;

    @Column({ nullable: true })
    phone!: string;

    // false: active, true: deleted
    @Column({ default: false })
    is_deleted!: boolean;

    @Column({ type: 'boolean', nullable: true, default: false })
    is_online!: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar!: string;

    @Column({ nullable: true, default: 1 })
    quantity!: number;

    // tai khoản được tạo bằng liên kết nào
    @Column({ type: 'enum', enum: ProviderEnum, default: ProviderEnum.LOCAL })
    provider!: ProviderEnum;

    @Column({ nullable: true })
    created_at!: number;
}
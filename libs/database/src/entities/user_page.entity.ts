
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { User } from './user.entity';
import { Fanpage } from './fanpage.entity';
import { ProviderEnum, RoleEnumUserPage } from 'libs/common/enums/role.enum';

@Entity('user_pages')
@Unique('uq_user_page_user_fanpage', ['user_id', 'fanpage_id'])
@Index('idx_user_page_user', ['user_id'])
@Index('idx_user_page_fanpage_created_at_id', ['fanpage_id', 'created_at', 'id'],)
export class UserPage {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    user_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ nullable: true })
    fanpage_id!: number;

    @ManyToOne(() => Fanpage)
    @JoinColumn({ name: 'fanpage_id' })
    page!: Fanpage;

    @Column({ type: 'enum', enum: ProviderEnum, default: ProviderEnum.LOCAL })
    provider!: ProviderEnum;

    // user được kết nối vào page với quyền
    @Column({ type: 'enum', enum: RoleEnumUserPage, default: RoleEnumUserPage.ADMIN_MANAGE })
    role!: RoleEnumUserPage;

    @Column({ nullable: true })
    created_at!: number;

}

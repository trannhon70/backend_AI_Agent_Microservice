import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ nullable: true })
    name!: string;


    @Column({ nullable: true })
    created_at!: number;
}

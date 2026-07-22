import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '@app/database/entities/role.entity';
import { User } from '@app/database/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([Role, User]),
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
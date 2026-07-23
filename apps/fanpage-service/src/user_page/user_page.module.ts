import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPage } from '@app/database/entities/user_page.entity';
import { UserPageController } from './user_page.controller';
import { UserPageService } from './user_page.service';
import { User } from '@app/database/entities/user.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { Role } from '@app/database/entities/role.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserPage, User, Fanpage, Role]),
    ],
    providers: [UserPageService],
    controllers: [UserPageController],
    exports: [UserPageService],
})
export class UserPageModule { }
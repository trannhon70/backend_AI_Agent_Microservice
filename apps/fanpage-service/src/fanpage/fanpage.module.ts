import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPage } from '@app/database/entities/user_page.entity';

import { User } from '@app/database/entities/user.entity';
import { Fanpage } from '@app/database/entities/fanpage.entity';
import { Role } from '@app/database/entities/role.entity';
import { FanPageController } from './fanpage.controller';
import { FanPageService } from './fanpage.service';
import { PageToken } from '@app/database/entities/page_token.entity';
import { FanPagesRepository } from './fanpages.repository';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserPage, User, Fanpage, Role, PageToken]),
    ],
    providers: [FanPageService, FanPagesRepository],
    controllers: [FanPageController],
    exports: [FanPageService],
})
export class FanPageModule { }
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from 'libs/common/decorators/roles.decorator';
import { RoleEnum } from 'libs/common/enums/role.enum';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { GetPagingMessagesDto } from 'libs/common/dto/messages/index.dto';

@Controller('chat-service/messages')
export class MessagesController {
    constructor(
        private readonly MessagesService: MessagesService
    ) { }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    getPaging(@Query() query: GetPagingMessagesDto) {
        return this.MessagesService.getPaging(query);
    }


}
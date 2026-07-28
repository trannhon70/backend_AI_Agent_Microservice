import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
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

    @Post()
    @UseGuards(JwtAuthGuard)
    async send(@Req() req: any, @Body() body: any) {
        let attachments = body?.attachments;
        let url = body?.attachments?.[0]?.url;
        return this.MessagesService.send({
            user_id: req.user.id,
            ...body,
            url,
            attachments,
        });
    }

}
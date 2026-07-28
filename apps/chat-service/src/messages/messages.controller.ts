import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MessagesService } from './messages.service';
import { GetPagingMessagesDto } from 'libs/common/dto/messages/index.dto';

@Controller()
export class MessagesController {
    constructor(private readonly MessagesService: MessagesService) { }



    @GrpcMethod('MessagesService', 'GetPaging')
    async GetPaging(query: GetPagingMessagesDto) {
        const result = await this.MessagesService.GetPaging(query);
        return {
            code: GrpcStatus.OK,
            message: 'get paging success!',
            data: result,   // ✅ đúng vì proto giờ khai data là 1 message, không phải repeated
        };
    }

    @GrpcMethod('MessagesService', 'Send')
    async Send(dto: any) {
        await this.MessagesService.Send(dto);
        return {
            code: GrpcStatus.OK,
            message: 'get paging success!',
        };
    }


}
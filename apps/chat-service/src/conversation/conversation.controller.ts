import { Controller, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ConversationService } from './conversation.service';
import { GetPagingConversationDto } from 'libs/common/dto/conversation/index.dto';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class ConversationController {
    constructor(private readonly ConversationService: ConversationService) { }



    @GrpcMethod('ConversationService', 'GetPaging')
    async GetPaging(query: GetPagingConversationDto) {
        const result = await this.ConversationService.GetPaging(query);
        return {
            code: GrpcStatus.OK,
            message: 'get paging success!',
            data: result,   // ✅ đúng vì proto giờ khai data là 1 message, không phải repeated
        };
    }

    @GrpcMethod('ConversationService', 'FacebookSend')
    async FacebookSend(data: { payload: string }) {
        const result = await this.ConversationService.FacebookSend(data.payload);
        return {
            code: GrpcStatus.OK,
            message: 'Facebook send success!',
            data: JSON.stringify(result)
        };
    }

    @GrpcMethod('ConversationService', 'UpdateUnreadCount')
    async UpdateUnreadCount(data: { data: string }) {
        const result = await this.ConversationService.UpdateUnreadCount(data.data);
        return {
            code: GrpcStatus.OK,
            message: 'Facebook send success!',
            data: JSON.stringify(result)
        };
    }

}
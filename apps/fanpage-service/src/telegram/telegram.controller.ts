import { status as GrpcStatus } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TelegramService } from './telegram.service';
import { SyncingTelegramDto } from 'libs/common/dto/telegram/index.dto';

@Controller()
export class TelegramController {
    constructor(private readonly TelegramService: TelegramService) { }

    @GrpcMethod('TelegramService', 'ConnectPageTelegram')
    async ConnectPageTelegram(dto: any) {
        await this.TelegramService.ConnectPageTelegram(dto);
        return {
            code: GrpcStatus.OK,
            message: 'connect telegram success!',
        };
    }

    @GrpcMethod('TelegramService', 'Syncing')
    async Syncing(dto: SyncingTelegramDto) {
        await this.TelegramService.Syncing(dto);
        return {
            code: GrpcStatus.OK,
            message: 'Syncing telegram success!',
        };
    }

}
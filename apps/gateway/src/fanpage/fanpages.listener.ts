import { DomainEvents } from '@app/kafka/kafka.events';
import { SocketService } from '@app/socket';
import { Controller, Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class FanpageSyncListener {
    constructor(
        private readonly socketService: SocketService,
    ) { }

    @EventPattern(DomainEvents.FanPage_sync_socket)
    handleSync(payload: any) {
        this.socketService.emitToRoom(`page:${payload.page_id}`, 'syncStatus', payload);
    }
}
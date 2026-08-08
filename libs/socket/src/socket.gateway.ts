// socket.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common'; // 👈 thêm
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { RedisService } from 'libs/redis/redis.service'; // 👈 thêm
import { SOCKET_EMIT_CHANNEL } from 'libs/common/constants/redis.constants';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayInit, OnModuleInit { // 👈 thêm OnModuleInit
    @WebSocketServer()
    server!: Server;

    constructor(
        private readonly socketService: SocketService,
        private readonly redisService: RedisService, // 👈 thêm
    ) {
        console.log('✅ SocketGateway initialized');
    }

    afterInit(server: Server) {
        console.log('[Gateway] afterInit called');
        this.socketService.setServer(server);
    }

    // 👇 THÊM MỚI — lắng nghe mọi service khác publish lên Redis
    onModuleInit() {
        this.redisService.onChannelMessage(SOCKET_EMIT_CHANNEL, (message) => {
            try {
                const payload = JSON.parse(message);
                this.socketService.emitToRoom(`page:${payload.page_id}`, 'syncStatus', payload);
            } catch (err) {
                console.error('[SocketGateway] Parse message lỗi', err);
            }
        });
        console.log('📡 SocketGateway đang lắng nghe channel:', SOCKET_EMIT_CHANNEL);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
        client.join(roomId);
        console.log(`📥 Client ${client.id} joined room ${roomId}`);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
        client.leave(roomId);
        console.log(`📤 Client ${client.id} leave room ${roomId}`);
    }
}
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody, // 👈 thiếu cái này
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayInit {
    @WebSocketServer()
    server!: Server;

    constructor(private readonly socketService: SocketService) {
        console.log('✅ SocketGateway initialized');
    }

    afterInit(server: Server) { // 👈 nhận server từ Nest
        console.log('[Gateway] afterInit called');
        this.socketService.setServer(server);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
        client.join(roomId);
        console.log(`📥 Client ${client.id} joined room ${roomId}`);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
        client.leave(roomId);
        console.log(`📥 Client ${client.id} leave room ${roomId}`);
    }
}
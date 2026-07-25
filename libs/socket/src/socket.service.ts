import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
    private server!: Server;

    setServer(server: Server) {
        this.server = server;
        console.log('[SocketService] Server has been set');
    }

    emitToAll(event: string, payload: any) {
        if (!this.server) {
            console.error('[SocketService] Server chưa được set!');
            return;
        }
        // console.log(`[SocketService] Emit "${event}":`, payload);
        this.server.emit(event, payload);
    }

    emitToRoom(room: string, event: string, payload: any) {
        if (this.server) {
            this.server.to(room).emit(event, payload);
        }
    }


    getServer(): Server {
        return this.server;
    }
}

import { forwardRef, Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
// import { FanpageSyncListener } from '../fanpages/fanpages.listener';
// import { ConversationListener } from '../conversations/conversations.listener';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
  imports: [
    // forwardRef(() => MessageModule),
  ], // 👈 để ChatGateway dùng MessageService 
  providers: [SocketService, SocketGateway
    // , FanpageSyncListener, ConversationListener
  ],
  exports: [SocketService, SocketGateway], // 👈 export để middleware hoặc service khác dùng
})
export class SocketModule { }

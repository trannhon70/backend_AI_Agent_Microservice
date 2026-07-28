import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import { SocketService } from '@app/socket';

interface ConversationGrpcService {
  FacebookSend(data: any): Observable<any>;
}

@Injectable()
export class WebhooksService implements OnModuleInit {
  private ConversationGrpcService!: ConversationGrpcService;

  constructor(
    @Inject('CHAT_PACKAGE') private readonly client: ClientGrpc,
    private readonly socketService: SocketService,
  ) { }

  onModuleInit() {
    this.ConversationGrpcService = this.client.getService<ConversationGrpcService>('ConversationService');
  }

  async facebookSend(body: any) {
    const payload = {
      payload: JSON.stringify(body),
    };
    const result = await firstValueFrom(this.ConversationGrpcService.FacebookSend(payload));
    return this.handleSync(JSON.parse(result.data))
  }

  handleSync(payload: any) {
    this.socketService.emitToRoom(`conversation:${payload.conversation_id}`, 'send_message', payload.message);
    this.socketService.emitToRoom(`page:${payload.page_id}`, 'send_conversation', payload.conversation);
  }

}

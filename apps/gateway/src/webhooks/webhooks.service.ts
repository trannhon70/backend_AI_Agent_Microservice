import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';

interface ConversationGrpcService {
  FacebookSend(data: any): Observable<any>;
}

@Injectable()
export class WebhooksService implements OnModuleInit {
  private ConversationGrpcService!: ConversationGrpcService;

  constructor(
    @Inject('CHAT_PACKAGE') private readonly client: ClientGrpc,

  ) { }

  onModuleInit() {
    this.ConversationGrpcService = this.client.getService<ConversationGrpcService>('ConversationService');
  }

  facebookSend(body: any) {
    const payload = {
      payload: JSON.stringify(body),
    };
    return firstValueFrom(this.ConversationGrpcService.FacebookSend(payload));
  }


}

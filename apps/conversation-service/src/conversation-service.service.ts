import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

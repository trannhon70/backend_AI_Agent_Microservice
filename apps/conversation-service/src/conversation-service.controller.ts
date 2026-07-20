import { Controller, Get } from '@nestjs/common';
import { ConversationServiceService } from './conversation-service.service';

@Controller()
export class ConversationServiceController {
  constructor(private readonly conversationServiceService: ConversationServiceService) {}

  @Get()
  getHello(): string {
    return this.conversationServiceService.getHello();
  }
}

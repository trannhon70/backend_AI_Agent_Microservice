import { Module } from '@nestjs/common';
import { ConversationServiceController } from './conversation-service.controller';
import { ConversationServiceService } from './conversation-service.service';

@Module({
  imports: [],
  controllers: [ConversationServiceController],
  providers: [ConversationServiceService],
})
export class ConversationServiceModule {}

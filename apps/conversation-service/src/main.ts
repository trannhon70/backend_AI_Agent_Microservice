import { NestFactory } from '@nestjs/core';
import { ConversationServiceModule } from './conversation-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ConversationServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

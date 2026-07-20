import { NestFactory } from '@nestjs/core';
import { FanpageServiceModule } from './fanpage-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FanpageServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();

import { Injectable } from '@nestjs/common';

@Injectable()
export class FanpageServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

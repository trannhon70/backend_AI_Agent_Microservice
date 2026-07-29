import { Body, Controller, ForbiddenException, Get, Post, Query, Req } from '@nestjs/common';
import { CheckObjectFacebook } from 'libs/common/utils';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,

  ) { }

  @Get('facebook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {

    if (token === process.env.FB_VERIFY_TOKEN) {
      return challenge;
    }

    throw new ForbiddenException();
  }

  @Post('facebook')
  async facebookSend(@Req() req: any, @Body() body: any) {

    if (body.object === CheckObjectFacebook.PAGE) {
      return this.webhooksService.facebookSend(body.entry)
    }
    return 'EVENT_RECEIVED';
  }
}

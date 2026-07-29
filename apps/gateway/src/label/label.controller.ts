import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'libs/common/guards/jwt-auth.guard';
import { LabelService } from './label.service';
import { GetPagingLabelDto } from 'libs/common/dto/label/index.dto';

@Controller('chat-service/labels')
export class LabelController {
    constructor(
        private readonly LabelService: LabelService
    ) { }

    @Get('get-paging')
    @UseGuards(JwtAuthGuard)
    async getPaging(@Query() query: GetPagingLabelDto) {
        const result = await this.LabelService.getPaging(query);
        return {
            code: result.code,
            message: result.message,
            data: JSON.parse(result.data)
        }
    }



}
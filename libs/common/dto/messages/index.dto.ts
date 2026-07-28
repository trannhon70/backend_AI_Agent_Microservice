import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class GetPagingMessagesDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageIndex!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit!: number;

    @IsOptional()
    @IsString()
    search!: string;

    @IsOptional()
    @IsString()
    conversation_id!: string;
}

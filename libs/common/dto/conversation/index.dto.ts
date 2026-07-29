import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class GetPagingConversationDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit!: number;

    @Type(() => String)
    @IsString()
    page_id!: string;

    @IsOptional()
    @IsString()
    search!: string;

    @IsOptional()
    @IsString()
    lastId!: number;

    @IsOptional()
    @IsString()
    lastUpdatedAt!: number;
}

export class updateUnreadCountConversationDto {
    @Type(() => Number)
    @IsInt()
    conversation_id!: number;

    @Type(() => Number)
    @IsInt()
    unread_count!: number;

    @Type(() => String)
    @IsString()
    page_id!: string;

}
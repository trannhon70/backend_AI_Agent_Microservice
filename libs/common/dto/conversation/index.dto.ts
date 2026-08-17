import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class GetPagingConversationDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageIndex!: number;

    @Type(() => String)
    @IsString()
    page_id!: string;

    @IsOptional()
    @IsString()
    search!: string;

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

export class addLabelToConversationDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    id!: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    label_id!: number;

    @IsNotEmpty()
    @Type(() => String)
    @IsString()
    page_id!: string;

    @IsNotEmpty()
    @Type(() => String)
    @IsString()
    name!: string;

    @IsNotEmpty()
    @Type(() => String)
    @IsString()
    color!: string;

}
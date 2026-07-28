import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
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


export class AttachmentDto {
    @IsString()
    id!: string;

    @IsString()
    url!: string;

    @IsOptional()
    @IsString()
    preview_url?: string;

    @IsOptional()
    @IsString()
    mime_type?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    width?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    height?: number;

    // Các field khác của Facebook nếu có
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    size?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    duration?: number;

    @IsOptional()
    @IsString()
    image_type?: string;

    @IsOptional()
    @IsBoolean()
    render_as_sticker?: boolean;
}
export class CreateMessageDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttachmentDto)
    attachments!: AttachmentDto[];

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    conversation_id!: number;

    @IsOptional()
    @IsString()
    customer_id!: string;

    @IsOptional()
    @IsString()
    direction!: string;

    @IsOptional()
    @IsString()
    id!: string;

    @IsOptional()
    @IsString()
    page_id!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sent_at!: number;

    @IsOptional()
    @IsString()
    text!: string;

    @IsOptional()
    @IsString()
    type!: string;

    @IsOptional()
    reply_to!: any;
}
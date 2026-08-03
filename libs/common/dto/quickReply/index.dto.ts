import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";


export class CreateQuickReplyDto {
    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    quick_reply_category_id?: number;

    @IsString()
    @IsNotEmpty()
    page_id!: string;
}
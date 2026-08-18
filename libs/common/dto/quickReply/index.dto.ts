import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";


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

export class CopyQuickReplyDto {
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    source_id!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    landing_id?: number;

    @IsArray()
    @Type(() => Number)
    @IsInt({ each: true })
    selectedKeys!: number[];

    @IsString()
    @IsNotEmpty()
    mode!: string;
}


export class GetPagingQuickReplyDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    pageIndex!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    limit!: number;

    @IsOptional()
    @IsString()
    search!: string;

    @IsString()
    @IsNotEmpty()
    page_id!: string;
}

export class GetAllQuickReplyDto {
    @IsString()
    @IsNotEmpty()
    page_id!: string;
}

export class UpdateQuickReplyDto {
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    id?: number;

    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    quick_reply_category_id?: number;

}

export class DeleteQuickReplyDto {
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    id?: number;
}
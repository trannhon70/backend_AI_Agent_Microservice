import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";


export class CreateQuickReplyCategoriesDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    color!: string;

    @IsString()
    @IsNotEmpty()
    page_id?: string;
}

export class UpdateQuickReplyCategoriesDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    color!: string;

    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    id?: number;


}


export class GetPagingQuickReplyCategoriesDto {
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

export class GetAllQuickReplyCategoriesDto {
    @IsString()
    @IsNotEmpty()
    page_id!: string;
}
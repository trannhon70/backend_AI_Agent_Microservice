import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class GetPagingLabelDto {
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

    @Transform(({ value }) => value === "true")
    @IsBoolean()
    is_deleted!: boolean;
}
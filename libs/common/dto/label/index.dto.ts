import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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

export class CreateLabelDto {
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

    @IsOptional()
    @Transform(({ value }) => {
        if (value === true || value === "true") return true;
        if (value === false || value === "false") return false;
        return undefined;
    })
    @IsBoolean()
    is_deleted?: boolean;
}

export class DeleteLabelDto {
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    id!: number;
}

export class UpdateLabelDto extends PartialType(CreateLabelDto) {
    @Type(() => Number)
    @IsInt()
    id!: number;
}
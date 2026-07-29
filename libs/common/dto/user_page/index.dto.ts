import { Transform, Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class GetPagingUserPageDto {
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
    search?: string;

    @IsOptional()
    @IsString()
    provider?: string;
}

export class DeleteUserPageDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id!: number;
}

export class getPagingUserPageActiveDto {
    @IsOptional()
    @Transform(({ value }) => {
        if (
            value === undefined ||
            value === null ||
            value === '' ||
            value === 'undefined' ||
            value === 'null'
        ) {
            return 20;
        }

        const n = Number(value);
        return Number.isFinite(n) ? n : 20;
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageIndex?: number;

    @IsOptional()
    @IsString()
    page_id?: string;

    @IsOptional()
    @IsString()
    search?: string;

}
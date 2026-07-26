import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateConnectFanPageFacebookDto {
    @Type(() => Number)
    @IsInt()
    user_id!: number;

    @IsOptional()
    @IsString()
    access_token!: string;
}

export class TokenRenewalFacebookDto {
    @Type(() => Number)
    @IsInt()
    user_id!: number;

    @Type(() => Number)
    @IsInt()
    fanpage_id!: number;

    @IsOptional()
    @IsString()
    access_token!: string;
}
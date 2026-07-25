import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}


export class LoginV1Dto {
    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    full_name!: string;

    @IsString()
    @IsNotEmpty()
    avatar!: string;

    @IsString()
    @IsNotEmpty()
    provider!: string;
}

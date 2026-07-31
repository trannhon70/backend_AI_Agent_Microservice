import { IsNotEmpty, IsString, MaxLength } from "class-validator";


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
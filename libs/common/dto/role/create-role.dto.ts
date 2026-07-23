// apps/gateway/src/roles/dto/create-role.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
}

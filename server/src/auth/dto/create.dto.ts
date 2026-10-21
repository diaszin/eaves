import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { CreateProfileDto } from './create_profile.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO extends CreateProfileDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha-segura-123' })
  @IsString()
  @MinLength(8)
  password: string;
}

import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { CreateProfileDto } from './create_profile.dto.js';

export class CreateUserDTO extends CreateProfileDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

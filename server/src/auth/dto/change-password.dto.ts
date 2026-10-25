import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

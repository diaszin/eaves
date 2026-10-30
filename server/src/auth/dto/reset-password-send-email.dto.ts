import { IsEmail } from 'class-validator';

export class ResetPasswordSendEmailDTO {
  @IsEmail()
  email: string;
}

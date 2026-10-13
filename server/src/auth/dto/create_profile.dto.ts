import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  @IsNotEmpty()
  race: string;

  @IsString()
  @IsNotEmpty()
  incomeBraket: string;

  @IsString()
  @IsNotEmpty()
  emergencyPhone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'cep must be a valid CEP',
  })
  cep: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  birthDate: Date;
}

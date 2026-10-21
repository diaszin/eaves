import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 'Maria da Silva' })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ example: '12345678900' })
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty({ example: 'branca' })
  @IsString()
  @IsNotEmpty()
  race: string;

  @ApiProperty({ example: 'De 1 a 2 salários mínimos' })
  @IsString()
  @IsNotEmpty()
  incomeBraket: string;

  @ApiProperty({ example: '+5511999999999' })
  @IsString()
  @IsNotEmpty()
  emergencyPhone: string;

  @ApiProperty({ example: '12345-678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'cep must be a valid CEP',
  })
  cep: string;

  @ApiProperty({ example: '1990-01-15', type: Date })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  birthDate: Date;
}

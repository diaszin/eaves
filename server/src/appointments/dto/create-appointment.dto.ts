import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2026-10-20T14:00:00.000Z' })
  @IsDateString()
  initialDate: string;

  @ApiProperty({ example: 'paciente@exemplo.com', required: false })
  @IsEmail()
  @IsOptional()
  patientEmail: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  professionalId: number;

  @ApiProperty({ example: 'Atendimento inicial', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

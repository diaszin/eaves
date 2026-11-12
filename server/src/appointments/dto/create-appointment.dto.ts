import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
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

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  patientId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  professionalId: number;

  @ApiProperty({ example: 'Atendimento inicial', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

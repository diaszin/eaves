import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2026-10-20T14:00:00.000Z' })
  @IsDateString()
  initialDate: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  patientId: number;

  @ApiProperty({ example: 'Atendimento inicial', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

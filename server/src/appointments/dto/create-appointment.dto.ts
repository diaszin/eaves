import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2026-10-20T14:00:00.000Z' })
  initialDate: Date;

  @ApiProperty({ example: '2026-10-20T14:30:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: 1 })
  patientId: number;
}

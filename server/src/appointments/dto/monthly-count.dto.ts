import { ApiProperty } from '@nestjs/swagger';

export class MonthlyCountDto {
  @ApiProperty({
    description: 'Mês no formato YYYY-MM (fuso America/Bahia)',
    example: '2026-11',
  })
  month: string;

  @ApiProperty({
    description: 'Quantidade de agendamentos do profissional no mês',
    example: 4,
    minimum: 0,
  })
  count: number;
}

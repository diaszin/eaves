import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateGeneralSettingsDto {
  @ApiProperty({ example: 50, minimum: 1, maximum: 1440 })
  @IsInt()
  @Min(1)
  @Max(1440)
  therapySessionDurationMinutes: number;
}

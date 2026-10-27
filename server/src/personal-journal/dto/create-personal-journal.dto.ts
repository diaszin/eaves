import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreatePersonalJournalDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsPositive()
  emotion: number;
}

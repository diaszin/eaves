import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MicrosoftLoginDTO {
  @ApiProperty({ example: 'authorization-code' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiProperty({
    example: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_',
  })
  @IsString()
  @MinLength(43)
  codeVerifier: string;

  @ApiProperty({ example: 'http://localhost:3000/auth/callback' })
  @IsString()
  @MinLength(1)
  redirectUri: string;
}
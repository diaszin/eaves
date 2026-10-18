import { Module } from '@nestjs/common';
import { MicrosoftService } from './microsoft.service.js';

@Module({
  providers: [MicrosoftService],
  exports: [MicrosoftService],
})
export class MicrosoftModule {}

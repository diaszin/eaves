import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  imports: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

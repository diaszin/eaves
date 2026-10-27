import { Module } from '@nestjs/common';
import { PersonalJournalService } from './personal-journal.service.js';
import { PersonalJournalController } from './personal-journal.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalJournal } from './entities/personal-journal.entity.js';
import { Emotions } from './entities/emotions.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalJournal, Emotions]), AuthModule],
  controllers: [PersonalJournalController],
  providers: [PersonalJournalService],
})
export class PersonalJournalModule {}

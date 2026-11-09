import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity.js';
import { ScheduleShift } from './entities/schedule-shift.entity.js';
import { SchedulesService } from './schedules.service.js';
import { SchedulesController } from './schedules.controller.js';
import { SchedulesPolicy } from './schedules.policy.js';
import { AuthModule } from '../auth/auth.module.js';
import { GeneralSettingsModule } from '../settings/general-settings.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, ScheduleShift]),
    AuthModule,
    GeneralSettingsModule,
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService, SchedulesPolicy],
  exports: [SchedulesService],
})
export class SchedulesModule {}

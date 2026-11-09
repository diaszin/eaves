import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralSettingsController } from './general-settings.controller.js';
import { GeneralSettingsPolicy } from './general-settings.policy.js';
import { GeneralSettingsService } from './general-settings.service.js';
import { GeneralSettings } from './entities/general-settings.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([GeneralSettings])],
  controllers: [GeneralSettingsController],
  providers: [GeneralSettingsPolicy, GeneralSettingsService],
  exports: [GeneralSettingsService],
})
export class GeneralSettingsModule {}

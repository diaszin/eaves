import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Can } from '@nestjs/authorization';
import { GeneralSettingsPolicy } from './general-settings.policy.js';
import { GeneralSettingsService } from './general-settings.service.js';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dto.js';

@ApiTags('settings')
@ApiBearerAuth('JWT-auth')
@Controller('settings/general')
export class GeneralSettingsController {
  constructor(private readonly settingsService: GeneralSettingsService) {}

  @Get()
  @Can(GeneralSettingsPolicy, 'view')
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @Can(GeneralSettingsPolicy, 'update')
  update(@Body() dto: UpdateGeneralSettingsDto) {
    return this.settingsService.update(dto);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dto.js';
import { GeneralSettings } from './entities/general-settings.entity.js';

@Injectable()
export class GeneralSettingsService {
  constructor(
    @InjectRepository(GeneralSettings)
    private readonly settingsRepository: Repository<GeneralSettings>,
  ) {}

  async get() {
    const settings = await this.settingsRepository.findOneBy({ id: 1 });
    if (!settings) {
      throw new NotFoundException(
        'As configurações gerais não foram inicializadas',
      );
    }

    return settings;
  }

  async getSessionDurationInMinutes() {
    const settings = await this.get();
    return settings.therapySessionDurationMinutes;
  }

  async update(dto: UpdateGeneralSettingsDto) {
    const settings = await this.get();
    settings.therapySessionDurationMinutes = dto.therapySessionDurationMinutes;
    return this.settingsRepository.save(settings);
  }
}

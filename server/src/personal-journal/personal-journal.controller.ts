import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { PersonalJournalService } from './personal-journal.service.js';
import { CreatePersonalJournalDto } from './dto/create-personal-journal.dto.js';

import { CurrentUser } from '@nestjs/authentication';

@Controller('personal-journal')
export class PersonalJournalController {
  constructor(
    private readonly personalJournalService: PersonalJournalService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser('id') userId: number,
    @Body() createPersonalJournalDto: CreatePersonalJournalDto,
  ) {
    return this.personalJournalService.create(createPersonalJournalDto, userId);
  }

  @Get()
  findAll(@CurrentUser('id') userId: number) {
    return this.personalJournalService.findAll(userId);
  }

  @Get('/journal/:id')
  findOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.personalJournalService.findOne(id, userId);
  }

  @Get('/emotions')
  getAllEmotions() {
    return this.personalJournalService.getEmotions();
  }
}

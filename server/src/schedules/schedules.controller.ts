import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { SchedulesService } from './schedules.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { SchedulesPolicy } from './schedules.policy.js';
import { User } from '../auth/entities/user.entity.js';

@ApiTags('schedules')
@ApiBearerAuth('JWT-auth')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Can(SchedulesPolicy, 'create')
  create(
    @CurrentUser() user: User,
    @Body() createScheduleDto: CreateScheduleDto,
  ) {
    return this.schedulesService.create(createScheduleDto, user);
  }

  @Get()
  @Can(SchedulesPolicy, 'view')
  findAll(
    @CurrentUser() user: User,
    @Query('userId') userId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.schedulesService.findAll(user, {
      userId: userId ? +userId : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @Can(SchedulesPolicy, 'view')
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schedulesService.findOne(id, user);
  }

  @Patch(':id')
  @Can(SchedulesPolicy, 'update')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, updateScheduleDto, user);
  }

  @Delete(':id')
  @Can(SchedulesPolicy, 'delete')
  remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.schedulesService.remove(id, user);
  }

  @Get('user/:userId/slots')
  @Can(SchedulesPolicy, 'viewSchedule')
  getSlots(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('date') date: string,
  ) {
    return this.schedulesService.getSlotsByUserAndDate(userId, date);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { CurrentUser } from '@nestjs/authentication';
import { User } from '../auth/entities/user.entity.js';
import { Can } from '@nestjs/authorization';
import { AppointmentsPolicy } from './appointments.policy.js';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Can(AppointmentsPolicy, 'create')
  create(
    @CurrentUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    const data = {
      ...createAppointmentDto,
      createdBy: user,
    };

    return this.appointmentsService.create(data);
  }

  @Get()
  @Can(AppointmentsPolicy, 'view')
  findAll(@CurrentUser() user: User) {
    return this.appointmentsService.findAllByPatient(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.appointmentsService.findOneByUser(user, +id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}

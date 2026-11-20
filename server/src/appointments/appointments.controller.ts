import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { CurrentUser } from '@nestjs/authentication';
import { Role, User } from '../auth/entities/user.entity.js';
import { Can } from '@nestjs/authorization';
import { AppointmentsPolicy } from './appointments.policy.js';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { MonthlyCountDto } from './dto/monthly-count.dto.js';

@Controller('appointments')
@ApiBearerAuth('JWT-auth')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Can(AppointmentsPolicy, 'create')
  create(
    @CurrentUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {

    if (user.role !== Role.PATIENT && !createAppointmentDto.patientEmail) {
      throw new BadRequestException(
        'O e-mail do paciente é obrigatório para criar um agendamento.',
      );
    }

    const data = {
      ...createAppointmentDto,
      patientEmail:
        user.role === Role.PATIENT ? user.email : createAppointmentDto.patientEmail,
      createdBy: user,
      professionalId: createAppointmentDto.professionalId,
    };

    return this.appointmentsService.create(data);
  }

  @Get()
  @Can(AppointmentsPolicy, 'view')
  findAll(@CurrentUser() user: User) {
    return this.appointmentsService.findAll(user);
  }

  @Get('all')
  @Can(AppointmentsPolicy, 'view')
  @ApiOkResponse({ description: 'Todos os agendamentos, sem limite de quantidade' })
  findAllUnlimited(@CurrentUser() user: User) {
    return this.appointmentsService.findAllUnlimited(user);
  }

  @Get('professionals/:professionalId/monthly-count')
  @Can(AppointmentsPolicy, 'viewProfessionalStats')
  @ApiOkResponse({ type: MonthlyCountDto, isArray: true })
  monthlyCountByProfessional(
    @Param('professionalId', ParseIntPipe) professionalId: number,
  ) {
    return this.appointmentsService.countByMonthForProfessional(professionalId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.appointmentsService.findOneByUser(user, +id);
  }

  @Patch(':id/cancel')
  @Can(AppointmentsPolicy, 'cancel')
  @ApiOkResponse({
    description: 'Agendamento cancelado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        status: { type: 'string', example: 'cancelled' },
      },
    },
  })
  cancel(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.cancel(user, id);
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

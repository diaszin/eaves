import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity.js';
import { Appointment } from './entities/appointment.entity.js';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  create(createAppointmentDto: CreateAppointmentDto) {
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
    });

    return this.appointmentRepository.save(appointment);
  }

  findAllByUser(user: User) {
    return this.appointmentRepository.find({
      where: {
        user: user,
      },
    });
  }

  findOneByUser(user: User, id: number) {
    return `This action returns a #${id} appointment`;
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}

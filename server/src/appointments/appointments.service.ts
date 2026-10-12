import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity.js';
import { Appointment } from './entities/appointment.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service.js';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly userService: AuthService,
  ) {}

  async create(dto: {
    initialDate: Date;
    endDate: Date;
    patientId: number;
    createdBy: User;
  }) {
    const patient = await this.userService.findUser(dto.patientId);

    if (!patient) {
      throw new NotFoundException(
        'O paciente não existe em nossa base de dados',
      );
    }

    const appointment = this.appointmentRepository.create({
      initialDate: dto.initialDate,
      endDate: dto.endDate,

      createdBy: dto.createdBy,
      patient: patient,
    });

    return this.appointmentRepository.save(appointment);
  }

  findAllByPatient(patient: User) {
    return this.appointmentRepository.find({
      where: {
        patient: patient,
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

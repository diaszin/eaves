import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { Repository } from 'typeorm';
import { Role, User } from '../auth/entities/user.entity.js';
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

  findAll(user: User) {
    if (user.role === Role.PATIENT) {
      return this.appointmentRepository.find({
        where: {
          patient: { id: user.id },
        },
        relations: {
          patient: { profile: true },
          createdBy: { profile: true },
        },
      });
    }

    return this.appointmentRepository.find({
      relations: {
        patient: { profile: true },
        createdBy: { profile: true },
      },
      order: {
        initialDate: 'DESC',
      },
    });
  }

  findAllByPatient(patient: User) {
    return this.findAll(patient);
  }

  findOneByUser(user: User, id: number) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: {
        patient: { profile: true },
        createdBy: { profile: true },
      },
    });
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  remove(id: number) {
    return this.appointmentRepository.delete(id);
  }
}

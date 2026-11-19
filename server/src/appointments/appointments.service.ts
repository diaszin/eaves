import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { FindOptionsSelect, LessThan, MoreThan, Repository } from 'typeorm';
import { Role, User } from '../auth/entities/user.entity.js';
import { Appointment } from './entities/appointment.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service.js';
import { GeneralSettingsService } from '../settings/general-settings.service.js';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly userService: AuthService,
    private readonly settingsService: GeneralSettingsService,
  ) {}

  async create(dto: {
    initialDate: string;
    patientEmail: string;
    professionalId: number;
    notes?: string;
    createdBy: User;
  }) {
    const patient = await this.userService.findByEmail(dto.patientEmail);

    if (!patient) {
      throw new NotFoundException(
        'Não existe um paciente com esse e-mail em nossa base de dados',
      );
    }

    const professional = await this.userService.findUser(dto.professionalId);

    if (!professional) {
      throw new NotFoundException(
        'O profissional não existe em nossa base de dados',
      );
    }

    const initialDate = new Date(dto.initialDate);
    if (Number.isNaN(initialDate.getTime())) {
      throw new BadRequestException('A data inicial do agendamento é inválida');
    }

    const therapySessionDurationMinutes =
      await this.settingsService.getSessionDurationInMinutes();
    const endDate = new Date(
      initialDate.getTime() + therapySessionDurationMinutes * 60_000,
    );

    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: {
        professional: { id: professional.id },
        initialDate: LessThan(endDate),
        endDate: MoreThan(initialDate),
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException(
        'O profissional já possui um agendamento nesse horário',
      );
    }

    const appointment = this.appointmentRepository.create({
      initialDate,
      endDate,
      notes: dto.notes ?? null,
      createdBy: dto.createdBy,
      patient: patient,
      professional: professional,
    });

    return this.appointmentRepository.save(appointment);
  }

  findAll(user: User) {
    const allowedUserColumns: FindOptionsSelect<User> = {
      email: true,
      id: true,
      role: true,
      profile: {
        fullname: true,
        emergencyPhone: true,
        birthday: true,
      },
    };

    return this.appointmentRepository.find({
      select: {
        id: true,
        initialDate: true,
        endDate: true,
        patient: allowedUserColumns,
        professional: allowedUserColumns,
        createdBy: allowedUserColumns,
      },
      ...(user.role === Role.PATIENT
        ? { where: { patient: { id: user.id } } }
        : {}),
      relations: {
        patient: { profile: true },
        createdBy: { profile: true },
        professional: { profile: true },
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
        professional: { profile: true },
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

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { FindOptionsSelect, LessThan, MoreThan, Repository } from 'typeorm';
import { Role, User } from '../auth/entities/user.entity.js';
import { Appointment, AppointmentStatus } from './entities/appointment.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service.js';
import { GeneralSettingsService } from '../settings/general-settings.service.js';
import { MonthlyCountDto } from './dto/monthly-count.dto.js';

const APPOINTMENTS_TIME_ZONE = 'America/Bahia';
// America/Bahia não tem horário de verão desde 2019 (UTC-3 fixo).
const TIME_ZONE_OFFSET = '-03:00';
const MONTHLY_COUNT_WINDOW = 6;

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
        status: AppointmentStatus.SCHEDULED,
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
    return this.queryAppointments(user, 5);
  }

  findAllUnlimited(user: User) {
    return this.queryAppointments(user);
  }

  private queryAppointments(user: User, limit?: number) {
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
        status: true,
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
      ...(limit !== undefined ? { take: limit } : {}),
    });
  }

  /**
   * Quantidade de agendamentos por mês (últimos 6 meses, incluindo o corrente)
   * em que o usuário informado é o profissional. Meses sem agendamento
   * retornam 0. Os meses seguem o fuso America/Bahia.
   */
  async countByMonthForProfessional(
    professionalId: number,
    now: Date = new Date(),
  ): Promise<MonthlyCountDto[]> {
    const professional = await this.userService.findUser(professionalId);

    if (!professional || professional.role !== Role.TRAINEE) {
      throw new NotFoundException(
        'O estagiário não existe em nossa base de dados',
      );
    }

    const months = this.lastMonths(now, MONTHLY_COUNT_WINDOW);
    const [startYear, startMonth] = months[0].split('-');
    const nextMonth = this.nextMonth(months[months.length - 1]);

    const rows = await this.appointmentRepository
      .createQueryBuilder('a')
      .select(
        `to_char(a."initialDate" AT TIME ZONE '${APPOINTMENTS_TIME_ZONE}', 'YYYY-MM')`,
        'month',
      )
      .addSelect('COUNT(*)', 'count')
      .where('a."professionalId" = :id', { id: professionalId })
      .andWhere('a."initialDate" >= :start', {
        start: `${startYear}-${startMonth}-01T00:00:00${TIME_ZONE_OFFSET}`,
      })
      .andWhere('a."initialDate" < :end', {
        end: `${nextMonth}-01T00:00:00${TIME_ZONE_OFFSET}`,
      })
      .groupBy('month')
      .getRawMany<{ month: string; count: string }>();

    const countByMonth = new Map(rows.map((r) => [r.month, Number(r.count)]));

    return months.map((month) => ({
      month,
      count: countByMonth.get(month) ?? 0,
    }));
  }

  private currentMonth(now: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: APPOINTMENTS_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
    }).formatToParts(now);
    const year = parts.find((p) => p.type === 'year')!.value;
    const month = parts.find((p) => p.type === 'month')!.value;
    return `${year}-${month}`;
  }

  private nextMonth(month: string): string {
    const [year, m] = month.split('-').map(Number);
    return m === 12
      ? `${year + 1}-01`
      : `${year}-${String(m + 1).padStart(2, '0')}`;
  }

  private lastMonths(now: Date, size: number): string[] {
    const [endYear, endMonth] = this.currentMonth(now).split('-').map(Number);
    const months: string[] = [];
    for (let i = size - 1; i >= 0; i--) {
      const index = endYear * 12 + (endMonth - 1) - i;
      const year = Math.floor(index / 12);
      const month = (index % 12) + 1;
      months.push(`${year}-${String(month).padStart(2, '0')}`);
    }
    return months;
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

  async cancel(user: User, id: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: { patient: true },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (user.role === Role.PATIENT && appointment.patient.id !== user.id) {
      throw new ForbiddenException(
        'Você só pode cancelar os seus próprios agendamentos',
      );
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('O agendamento já está cancelado');
    }

    if (appointment.endDate.getTime() <= Date.now()) {
      throw new BadRequestException(
        'Não é possível cancelar um agendamento já encerrado',
      );
    }

    // Atualização condicional: se outro usuário cancelou entre a leitura e a
    // escrita, nenhuma linha é afetada e respondemos como "já cancelado".
    const result = await this.appointmentRepository.update(
      { id, status: AppointmentStatus.SCHEDULED },
      { status: AppointmentStatus.CANCELLED },
    );

    if (!result.affected) {
      throw new BadRequestException('O agendamento já está cancelado');
    }

    return { id, status: AppointmentStatus.CANCELLED };
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  remove(id: number) {
    return this.appointmentRepository.delete(id);
  }
}

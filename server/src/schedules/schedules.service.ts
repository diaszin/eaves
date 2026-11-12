import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity.js';
import { ScheduleShift } from './entities/schedule-shift.entity.js';
import { AuthService } from '../auth/auth.service.js';
import { User, Role } from '../auth/entities/user.entity.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { GeneralSettingsService } from '../settings/general-settings.service.js';

function getTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number,
) {
  const shiftStart =
    Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3, 5));
  const shiftEnd =
    Number(endTime.slice(0, 2)) * 60 + Number(endTime.slice(3, 5));
  const slots: { startTime: string; endTime: string }[] = [];

  const formatTime = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

  for (
    let slotStart = shiftStart;
    slotStart + slotDuration <= shiftEnd;
    slotStart += slotDuration
  ) {
    slots.push({
      startTime: formatTime(slotStart),
      endTime: formatTime(slotStart + slotDuration),
    });
  }

  return slots;
}

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(ScheduleShift)
    private readonly shiftRepository: Repository<ScheduleShift>,
    private readonly authService: AuthService,
    private readonly settingsService: GeneralSettingsService,
  ) {}

  async create(dto: CreateScheduleDto, createdBy: User) {
    const targetUser = await this.authService.findUser(dto.userId);
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado para esta escala.');
    }

    const schedule = this.scheduleRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      user: targetUser,
      createdBy: createdBy,
    });

    if (dto.shifts && dto.shifts.length > 0) {
      schedule.shifts = dto.shifts.map((shiftDto) =>
        this.shiftRepository.create({
          dayOfWeek:
            shiftDto.dayOfWeek !== undefined ? shiftDto.dayOfWeek : null,
          customDate: shiftDto.customDate ?? null,
          startTime: shiftDto.startTime,
          endTime: shiftDto.endTime,
          location: shiftDto.location ?? null,
          notes: shiftDto.notes ?? null,
          maxCapacity: shiftDto.maxCapacity ?? 1,
        }),
      );
    } else {
      schedule.shifts = [];
    }

    const savedSchedule = await this.scheduleRepository.save(schedule);
    return this.findOne(savedSchedule.id, createdBy);
  }

  async findAll(
    currentUser: User,
    filters?: { userId?: number; isActive?: boolean },
  ) {
    const qb = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('schedule.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.profile', 'creatorProfile')
      .leftJoinAndSelect('schedule.shifts', 'shifts');

    if (filters?.userId) {
      qb.andWhere('user.id = :userId', { userId: filters.userId });
    }

    if (filters?.isActive !== undefined) {
      qb.andWhere('schedule.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    qb.orderBy('schedule.startDate', 'DESC').addOrderBy('schedule.id', 'DESC');

    return qb.getMany();
  }

  async findOne(id: number, currentUser?: User) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: {
        user: { profile: true },
        createdBy: { profile: true },
        shifts: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Escala #${id} não encontrada.`);
    }

    return schedule;
  }

  async update(id: number, dto: UpdateScheduleDto, currentUser: User) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: { user: true, shifts: true },
    });

    if (!schedule) {
      throw new NotFoundException(`Escala #${id} não encontrada.`);
    }

    if (dto.userId && dto.userId !== schedule.user.id) {
      const newUser = await this.authService.findUser(dto.userId);
      if (!newUser) {
        throw new NotFoundException('Novo usuário não encontrado.');
      }
      schedule.user = newUser;
    }

    if (dto.title !== undefined) schedule.title = dto.title;
    if (dto.description !== undefined) schedule.description = dto.description;
    if (dto.startDate !== undefined) schedule.startDate = dto.startDate;
    if (dto.endDate !== undefined) schedule.endDate = dto.endDate;
    if (dto.isActive !== undefined) schedule.isActive = dto.isActive;

    // Atualiza turnos customizados se enviados
    if (dto.shifts !== undefined) {
      // Remove os turnos antigos
      await this.shiftRepository.delete({ schedule: { id: schedule.id } });

      schedule.shifts = dto.shifts.map((shiftDto) =>
        this.shiftRepository.create({
          dayOfWeek:
            shiftDto.dayOfWeek !== undefined ? shiftDto.dayOfWeek : null,
          customDate: shiftDto.customDate ?? null,
          startTime: shiftDto.startTime,
          endTime: shiftDto.endTime,
          location: shiftDto.location ?? null,
          notes: shiftDto.notes ?? null,
          maxCapacity: shiftDto.maxCapacity ?? 1,
          schedule: schedule,
        }),
      );
    }

    await this.scheduleRepository.save(schedule);
    return this.findOne(id, currentUser);
  }

  async remove(id: number, currentUser: User) {
    const schedule = await this.findOne(id, currentUser);
    await this.scheduleRepository.remove(schedule);
    return { success: true, message: `Escala #${id} removida com sucesso.` };
  }

  async getSlotsByUserAndDate(userId: number, dateStr: string) {
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Data inválida.');
    }

    const slotDuration =
      await this.settingsService.getSessionDurationInMinutes();
    if (!Number.isInteger(slotDuration) || slotDuration < 1) {
      throw new BadRequestException('Intervalo de horário inválido.');
    }

    const dayOfWeek = targetDate.getUTCDay(); // 0 = Domingo, 1 = Segunda, etc.
    const isoDateOnly = dateStr.slice(0, 10);

    const schedules = await this.scheduleRepository.find({
      where: {
        user: { id: userId },
        isActive: true,
      },
      relations: { shifts: true },
    });

    const activeSlots = [];
    for (const schedule of schedules) {
      // Checa se está no período de vigência da escala
      if (schedule.startDate && schedule.startDate > isoDateOnly) continue;
      if (schedule.endDate && schedule.endDate < isoDateOnly) continue;

      for (const shift of schedule.shifts) {
        const matchesDate = shift.customDate
          ? shift.customDate === isoDateOnly
          : shift.dayOfWeek === dayOfWeek;
        if (!matchesDate) continue;

        for (const slot of getTimeSlots(
          shift.startTime,
          shift.endTime,
          slotDuration,
        )) {
          activeSlots.push(Object.assign({}, shift, slot));
        }
      }
    }

    return activeSlots;
  }

  async getCalendarByTrainee(
    traineeId: number,
    startDate: Date,
    endDate: Date,
  ) {
    if (
      !(startDate instanceof Date) ||
      isNaN(startDate.getTime()) ||
      !(endDate instanceof Date) ||
      isNaN(endDate.getTime())
    ) {
      throw new BadRequestException('Período ou intervalo inválido.');
    }

    const rangeStart = startDate.toISOString().slice(0, 10);
    const rangeEnd = endDate.toISOString().slice(0, 10);
    if (rangeStart > rangeEnd) {
      throw new BadRequestException('Período inválido.');
    }

    const slotDuration =
      (await this.settingsService.getSessionDurationInMinutes()) ?? 20;
    if (!Number.isInteger(slotDuration) || slotDuration < 1) {
      throw new BadRequestException('Intervalo de horário inválido.');
    }

    const schedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.shifts', 'shifts')
      .where('schedule.userId = :traineeId', { traineeId })
      .andWhere('schedule.isActive = :isActive', { isActive: true })
      .getMany();

    return schedules.map((schedule) => {
      const firstDate =
        schedule.startDate > rangeStart ? schedule.startDate : rangeStart;
      const lastDate =
        schedule.endDate && schedule.endDate < rangeEnd
          ? schedule.endDate
          : rangeEnd;
      const date = new Date(`${firstDate}T00:00:00.000Z`);
      const last = new Date(`${lastDate}T00:00:00.000Z`);
      const shiftsForDates = [];

      while (date <= last) {
        const dateString = date.toISOString().slice(0, 10);
        const dayOfWeek = date.getUTCDay();

        for (const shift of schedule.shifts) {
          if (
            shift.customDate === dateString ||
            (!shift.customDate && shift.dayOfWeek === dayOfWeek)
          ) {
            for (const slot of getTimeSlots(
              shift.startTime,
              shift.endTime,
              slotDuration,
            )) {
              shiftsForDates.push({
                ...shift,
                date: dateString,
                ...slot,
              });
            }
          }
        }

        date.setUTCDate(date.getUTCDate() + 1);
      }

      return { ...schedule, shifts: shiftsForDates };
    });
  }
}

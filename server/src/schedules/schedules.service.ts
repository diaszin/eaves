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

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(ScheduleShift)
    private readonly shiftRepository: Repository<ScheduleShift>,
    private readonly authService: AuthService,
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
          dayOfWeek: shiftDto.dayOfWeek !== undefined ? shiftDto.dayOfWeek : null,
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
          dayOfWeek: shiftDto.dayOfWeek !== undefined ? shiftDto.dayOfWeek : null,
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
        // Corresponde a uma data customizada específica
        if (shift.customDate === isoDateOnly) {
          activeSlots.push(shift);
        } else if (!shift.customDate && shift.dayOfWeek === dayOfWeek) {
          // Ou corresponde ao dia da semana recorrente
          activeSlots.push(shift);
        }
      }
    }

    return activeSlots;
  }
}

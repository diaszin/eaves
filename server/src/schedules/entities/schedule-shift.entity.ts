import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { Schedule } from './schedule.entity.js';

@Entity('schedule_shift')
export class ScheduleShift {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Schedule', 'shifts', {
    onDelete: 'CASCADE',
    nullable: false,
  })
  schedule: Relation<Schedule>;

  @Column({ type: 'smallint', nullable: true })
  dayOfWeek: number | null; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  @Column({ type: 'date', nullable: true })
  customDate: string | null; // Data específica caso não seja recorrente semanal

  @Column({ type: 'varchar', length: 5, nullable: false })
  startTime: string; // ex: "08:00"

  @Column({ type: 'varchar', length: 5, nullable: false })
  endTime: string; // ex: "12:00"

  @Column({ type: 'varchar', length: 120, nullable: true })
  location: string | null; // ex: "Sala 02", "Consultório 1"

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'int', default: 1, nullable: false })
  maxCapacity: number;
}

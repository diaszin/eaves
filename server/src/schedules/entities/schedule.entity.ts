import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import type { ScheduleShift } from './schedule-shift.entity.js';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date', nullable: false })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @OneToMany('ScheduleShift', 'schedule', {
    cascade: true,
  })
  shifts: Relation<ScheduleShift>[];

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated: Date;
}

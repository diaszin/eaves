import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz', nullable: false })
  initialDate: Date;

  @Column({ type: 'timestamptz', nullable: false })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
    nullable: false,
  })
  status: AppointmentStatus;

  @CreateDateColumn()
  created: Date;

  @ManyToOne(() => User, {
    nullable: false,
  })
  createdBy: User;

  @ManyToOne(() => User, {
    nullable: false,
  })
  patient: User;

  @ManyToOne(() => User, {
    nullable: false,
  })
  professional: User;
}

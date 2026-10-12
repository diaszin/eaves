import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz', nullable: false })
  initialDate: Date;

  @Column({ type: 'timestamptz', nullable: false })
  endDate: Date;

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
}

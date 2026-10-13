import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity.js';

export enum Role {
  PATIENT = 'patient',
  LOBBY = 'lobby',
  TRAINEE = 'trainee',
  PROFESSOR = 'professor',
  COORDINATOR = 'coordinator',
}

@Entity({ name: 'User' })
@Index('User_email_key', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PATIENT,
    nullable: false,
  })
  role: Role;

  @OneToOne(() => Profile, {
    nullable: false,
  })
  @JoinColumn()
  profile: Profile;
}

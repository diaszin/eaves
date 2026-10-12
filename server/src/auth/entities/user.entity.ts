import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'text' })
  fullname!: string;

  @Column({ type: 'timestamp', precision: 3 })
  birthday!: Date;

  @Column({
	type: "enum",
    enum: Role,
    default: Role.PATIENT,
    nullable: false,
  })
  role: Role;
}

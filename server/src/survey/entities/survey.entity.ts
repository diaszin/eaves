import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './questions.entity.js';
import { Answers } from './answers.entity.js';
import { User } from '../../auth/entities/user.entity.js';

@Entity()
export class Survey {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Question, {
    nullable: false,
  })
  question!: Question;

  @ManyToOne(() => Answers, {
    nullable: false,
  })
  answer!: Answers;

  @Column({
    type: 'text',
    nullable: false,
  })
  type!: string;

  @ManyToOne(() => User, {
    nullable: false,
  })
  answeredBy!: User;

  @CreateDateColumn()
  answeredDate!: Date;
}

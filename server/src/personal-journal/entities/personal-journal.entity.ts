import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import { Emotions } from './emotions.entity.js';

@Entity()
export class PersonalJournal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  content!: string;

  @ManyToOne(() => Emotions, { nullable: false })
  emotion!: Emotions;

  @ManyToOne(() => User, {
    nullable: false,
  })
  createdBy!: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate!: Date;
}

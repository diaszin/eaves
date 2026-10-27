import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Emotion {
  FEAR = 'fear',
  ANGRY = 'angry',
  HAPPY = 'happy',
  SAD = 'sad',
  PISH = 'pish',
  SURPRISE = 'surprise',
}

@Entity()
export class Emotions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Emotion,
    nullable: false,
  })
  emotion: Emotion;
}

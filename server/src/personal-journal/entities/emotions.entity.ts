import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Emotions {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  emotion!: string;
}

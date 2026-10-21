import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  content!: string;


  @Column({
    type: 'text',
    nullable: false,
  })
  category!: string; 

  @UpdateDateColumn()
  updatedAt!: Date;

  @CreateDateColumn()
  createdDate!: Date;
}

import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'char varying',
  })
  fullname: string;

  @Column({
    nullable: false,
    type: 'char',
    length: 11,
  })
  document: string;

  @Column({
    nullable: false,
    type: 'char varying',
  })
  race: string;

  @Column({
    nullable: false,
    type: 'char varying',
  })
  incomeBraket: string;

  @Column({
    nullable: false,
    type: 'char varying',
  })
  emergencyPhone: string;

  @Column({
    nullable: false,
    type: 'char varying',
  })
  cep: string;

  @Column({ type: 'timestamp', precision: 3 })
  birthday!: Date;
}

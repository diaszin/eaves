import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    type: 'text',
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
    type: 'text',
  })
  race: string;

  @Column({
    nullable: false,
    type: 'text',
  })
  incomeBraket: string;

  @Column({
    nullable: false,
    type: 'text',
  })
  emergencyPhone: string;

  @Column({
    nullable: false,
    type: 'text',
  })
  cep: string;

  @Column({ type: 'timestamp', precision: 3 })
  birthday!: Date;
}

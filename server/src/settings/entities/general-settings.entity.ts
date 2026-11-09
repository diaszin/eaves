import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'general_settings' })
export class GeneralSettings {
  @PrimaryColumn({ type: 'smallint', default: 1 })
  id: number;

  @Column({ type: 'integer', default: 50 })
  therapySessionDurationMinutes: number;
}

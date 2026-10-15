import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { Appointment } from './appointments/entities/appointment.entity.js';
import { Profile } from './auth/entities/profile.entity.js';
import { User } from './auth/entities/user.entity.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set to use TypeORM migrations.');
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Profile, Appointment],
  migrations: [join(process.cwd(), 'dist', '**', '*.migration.js')],
  synchronize: false,
  logging: ['query', 'error', 'migration'],
  migrationsRun: false,
});
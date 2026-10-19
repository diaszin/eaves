import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

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
  entities: [
    join(process.cwd(), 'dist', '**', '*.entity.js'),
    join(process.cwd(), 'src', '**', '*.entity.ts'),
  ],

  migrations: [
    process.env.NODE_ENV === 'production'
      ? join(process.cwd(), 'dist', 'migration', '*.js')
      : join(process.cwd(), 'src', 'migration', '*.ts'),
    process.env.NODE_ENV === 'production'
      ? join(process.cwd(), 'dist', '**', 'migrations', '*.js')
      : join(process.cwd(), 'src', '**', 'migrations', '*.ts'),
  ],
  synchronize: false,
  logging: ['query', 'error', 'migration'],
  migrationsRun: false,
});

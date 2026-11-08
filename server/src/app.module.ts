import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '@nestjs/authentication';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { AuthorizationModule } from '@nestjs/authorization';
import { join } from 'node:path';
import { MicrosoftModule } from './microsoft/microsoft.module.js';
import { SurveyModule } from './survey/survey.module.js';
import { PersonalJournalModule } from './personal-journal/personal-journal.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accessToken: {
          key: process.env.JWT_SECRET!,
          issuer: 'https://api.eaves.com',
          audience: 'eaves-mobile',
          ttl: '2h',
        },
        passwordReset: {
          url: configService.get<string>(
            'PASSWORD_RESET_URL',
            'https://app.eaves.com/reset-password',
          ),
        },
      }),
    }),
    AuthorizationModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        extra: { options: '-c timezone=America/Bahia' },
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        synchronize: false,
        logging: ['query', 'error', 'migration'],
        entities: [
          join(process.cwd(), 'dist', '**', '*.entity.js'),
        ],
        migrations: [
          join(process.cwd(), 'dist', 'migration', '*.js'),
          join(process.cwd(), 'dist', '**', 'migrations', '*.js'),
        ],
        migrationsRun: true,
      }),
    }),
    AuthModule,
    AppointmentsModule,
    MicrosoftModule,
    SurveyModule,
    PersonalJournalModule,
    SchedulesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

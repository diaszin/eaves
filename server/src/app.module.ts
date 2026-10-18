import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '@nestjs/authentication';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { AuthorizationModule } from '@nestjs/authorization';
import { join } from 'node:path';
import { EmailModule } from './email/email.module.js';
import { TemplateModule } from './template/template.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule.forRootAsync({
      useFactory: () => ({
        accessToken: {
          key: process.env.JWT_SECRET!,
          issuer: 'https://api.eaves.com',
          audience: 'eaves-mobile',
          ttl: '2h',
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
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: ['query', 'error', 'migration'],
        entities: [
          join(process.cwd(), 'dist', '**', '*.entity.js'),
        ],
        migrations: [join(process.cwd(), 'dist', 'migration', '*.js')],
        migrationsRun: true,
      }),
    }),
    AuthModule,
    AppointmentsModule,
    EmailModule,
    TemplateModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

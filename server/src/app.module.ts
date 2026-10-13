import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '@nestjs/authentication';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { AuthorizationModule } from '@nestjs/authorization';
import { AuthenticationStorageMigration } from './auth/migrations/authentication-storage.migration.js';

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
        type: 'postgres' as const,
        url: configService.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development',
        migrations: [AuthenticationStorageMigration],
        migrationsRun: true,
        logging: ["query", "error"]
      }),
    }),
    AuthModule,
    AppointmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

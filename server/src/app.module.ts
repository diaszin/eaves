import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '@nestjs/authentication';
import { AppointmentsModule } from './appointments/appointments.module.js';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    AppointmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

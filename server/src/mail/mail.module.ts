import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule as NestMailModule, LogMailTransport } from '@nestjs/mail';
import { EmailModule } from '../email/email.module.js';
import { TemplateModule } from '../template/template.module.js';
import { AzureEmailTransport } from './azure-email.transport.js';
import { MailService } from './mail.service.js';

@Module({
  imports: [
    NestMailModule.forRootAsync({
      imports: [ConfigModule, EmailModule],
      inject: [ConfigService],
      transport:
        process.env.NODE_ENV === 'development'
          ? LogMailTransport
          : AzureEmailTransport,
      useFactory: (configService: ConfigService) => ({
        from: configService.getOrThrow<string>('AZURE_EMAIL_SENDER'),
        retry: false,
      }),
    }),
    TemplateModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

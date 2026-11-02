import { Injectable } from '@nestjs/common';
import { Mailer, type MailSendResult } from '@nestjs/mail';
import { TemplateService } from '../template/template.service.js';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: Mailer,
    private readonly templateService: TemplateService,
  ) {}

  async sendWelcomeEmail(to: string, name: string): Promise<MailSendResult> {
    const html = await this.templateService.renderWelcomeEmail({ name });

    return this.mailer.send({
      to,
      html,
      subject: 'Cadastro concluído',
    });
  }

  async sendPasswordResetEmail(
    to: string,
    url: string,
  ): Promise<MailSendResult> {
    const html = await this.templateService.renderResetPasswordEmail({ url });

    return this.mailer.send({
      to,
      html,
      subject: 'Redefinição de senha',
    });
  }
}

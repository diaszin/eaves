import {
  AuthenticationRegistry,
  PasswordResetAccount,
  PasswordResetHandler,
  PasswordResetLink,
} from '@nestjs/authentication';
import { AuthService } from './auth.service.js';
import { EmailService } from '../email/email.service.js';
import { TemplateService } from '../template/template.service.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordResetAction extends PasswordResetHandler {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('passwordReset', this);
  }

  async findUser(email: string): Promise<PasswordResetAccount | null> {
    const user = await this.authService.findByEmail(email);

    if (user) {
      const resetAccount: PasswordResetAccount = {
        email: user.email,
        id: user.id.toString(),
        passwordHash: user.password,
      };

      return resetAccount;
    }

    return null;
  }
  async send(link: PasswordResetLink): Promise<void> {
    const template = await this.templateService.renderResetPasswordEmail({
      url: link.url,
    });

    await this.emailService.sendEmail({
      to: link.email,
      subject: 'Redefinição de senha',
      html: template,
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.authService.updatePassword(userId, passwordHash);
  }
}

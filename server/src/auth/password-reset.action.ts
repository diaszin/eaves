import {
  AuthenticationRegistry,
  PasswordResetAccount,
  PasswordResetHandler,
  PasswordResetLink,
} from '@nestjs/authentication';
import { AuthService } from './auth.service.js';
import { MailService } from '../mail/mail.service.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordResetAction extends PasswordResetHandler {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
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
    await this.mailService.sendPasswordResetEmail(link.email, link.url);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    console.log(passwordHash);
    await this.authService.updatePassword(userId, passwordHash);
  }
}

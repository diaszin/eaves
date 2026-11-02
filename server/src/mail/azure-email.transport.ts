import { Injectable } from '@nestjs/common';
import {
  MailMessage,
  MailTransport,
  MailTransportResult,
  MailTransportSendOptions,
} from '@nestjs/mail';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class AzureEmailTransport extends MailTransport {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async send(
    message: MailMessage,
    options: MailTransportSendOptions,
  ): Promise<MailTransportResult> {
    options.signal.throwIfAborted();

    const result = await this.emailService.sendEmail({
      to: message.to.map(({ address }) => address),
      cc: message.cc.map(({ address }) => address),
      bcc: message.bcc.map(({ address }) => address),
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    return {
      accepted: [...message.to, ...message.cc, ...message.bcc].map(
        ({ address }) => address,
      ),
      providerMessageId: result.messageId,
    };
  }
}

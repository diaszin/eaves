import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  EmailClient,
  EmailContent,
  EmailRecipients,
} from '@azure/communication-email';
import { ConfigService } from '@nestjs/config';
import { MailConnectionError } from '@nestjs/mail';

@Injectable()
export class EmailService {
  private readonly client: EmailClient;
  private readonly sender: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.sender = configService.getOrThrow('AZURE_EMAIL_SENDER');

    this.client = new EmailClient(
      configService.getOrThrow(
        'AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING',
      ),
      {
        retryOptions: {
          maxRetries: 3,
        },
      },
    );
  }

  async sendEmail(params: {
    to: string | string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html?: string;
  }): Promise<{ messageId?: string }> {
    if (!params.text && !params.html) {
      throw new Error('Informe o conteúdo em texto ou HTML.');
    }

    const content: EmailContent = params.html
      ? {
          subject: params.subject,
          html: params.html,
          ...(params.text ? { plainText: params.text } : {}),
        }
      : { subject: params.subject, plainText: params.text! };

    const recipients: EmailRecipients = {
      to: (Array.isArray(params.to) ? params.to : [params.to]).map(
        (address) => ({ address }),
      ),
    };
    if (params.cc?.length) {
      recipients.cc = params.cc.map((address) => ({ address }));
    }
    if (params.bcc?.length) {
      recipients.bcc = params.bcc.map((address) => ({ address }));
    }

    try {
      const poller = await this.client.beginSend({
        senderAddress: this.sender,
        content: content,
        recipients,
      });

      const result = await poller.pollUntilDone();

      if (result.status !== 'Succeeded') {
        this.logger.error(`Falha no envio de e-mail: ${result.status}`);

        throw new MailConnectionError('Não foi possível enviar o e-mail.', {
          permanent: false,
        });
      }

      return { messageId: result.id };
    } catch (error) {
      if (error instanceof MailConnectionError) {
        throw error;
      }

      this.logger.error('Erro ao enviar e-mail via Azure', error);

      throw new InternalServerErrorException(
        'Não foi possível enviar o e-mail.',
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import Handlebars from 'handlebars';
import { readFile } from 'node:fs/promises';
import mjml2html from 'mjml';
import { MailTemplateError } from '@nestjs/mail';

@Injectable()
export class TemplateService {
  private readonly templatePath: string;

  constructor(private readonly configService: ConfigService) {
    this.templatePath =
      (configService.get('NODE_ENV', 'development') == 'development'
        ? join(process.cwd(), 'src', 'template', 'emails')
        : join(process.cwd(), 'dist', 'template', 'emails')) + '/';
  }

  async renderWelcomeEmail(data: { name: string }) {
    const welcomeEmailPath = this.templatePath + 'welcome.hbs.mjml';
    try {
      const source = await readFile(welcomeEmailPath, 'utf-8');

      const renderTemplate = Handlebars.compile(source);
      const template = renderTemplate({
        name: data.name,
      });

      const result = await mjml2html(template, {
        validationLevel: 'strict',
        ignoreIncludes: false,
        minify: true,
      });

      return result.html;
    } catch (error) {
      throw new MailTemplateError(`Failed to render welcome email template`);
    }
  }

  async renderResetPasswordEmail(data: { url: string }) {
    try {
      const resetPasswordPath = this.templatePath + 'reset-password.hbs.mjml';
      const source = await readFile(resetPasswordPath, 'utf-8');

      const renderTemplate = Handlebars.compile(source);
      const template = renderTemplate({
        url: data.url,
      });

      const result = await mjml2html(template, {
        validationLevel: 'strict',
        ignoreIncludes: false,
        minify: true,
      });

      return result.html;
    } catch (error) {
      throw new MailTemplateError(
        `Failed to render reset password email template`,
      );
    }
  }
}

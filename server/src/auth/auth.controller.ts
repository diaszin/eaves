import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';
import { MicrosoftLoginDTO } from './dto/microsoft-login.dto.js';
import { Public } from '@nestjs/authentication';
import { Role } from './entities/user.entity.js';
import { EmailService } from '../email/email.service.js';
import { TemplateService } from '../template/template.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
  ) {}

  @Public()
  @Post('/signup')
  async signUp(@Body() dto: CreateUserDTO) {
    const userRole = Role.PATIENT;
    const userCreated = await this.authService.create(dto, userRole);
    const profileName = userCreated.profile.fullname.split(' ')[0];

    const emailTemplate = await this.templateService.renderWelcomeEmail({
      name: profileName,
    });

    this.emailService.sendEmail({
      to: userCreated.email,
      html: emailTemplate,
      subject: 'Cadastro com concluído',
    });
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: AuthLoginDTO) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('/microsoft')
  @HttpCode(HttpStatus.OK)
  signInWithMicrosoft(@Body() dto: MicrosoftLoginDTO) {
    console.log('Ele chamou aqui');
    return this.authService.loginWithMicrosoft(dto);
  }
}

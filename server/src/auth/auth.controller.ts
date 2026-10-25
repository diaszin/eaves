import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';
import { MicrosoftLoginDTO } from './dto/microsoft-login.dto.js';
import { CurrentUser, Public } from '@nestjs/authentication';
import { Role, User } from './entities/user.entity.js';
import { EmailService } from '../email/email.service.js';
import { TemplateService } from '../template/template.service.js';
import { UpdateUserDTO } from './dto/update.dto.js';
import { ChangePasswordDTO } from './dto/change-password.dto.js';

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

  @Get('/profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser('id') id: number) {
    return this.authService.getProfile(id);
  }

  @Patch('/profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@CurrentUser('id') id: number, dto: UpdateUserDTO) {
    return this.authService.update(id, dto);
  }
}

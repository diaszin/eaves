import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  Patch,
  Put,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';
import { MicrosoftLoginDTO } from './dto/microsoft-login.dto.js';
import {
  CurrentUser,
  PasswordResetService,
  Public,
} from '@nestjs/authentication';
import { MailService } from '../mail/mail.service.js';
import { UpdateUserDTO } from './dto/update.dto.js';
import { ChangePasswordDTO } from './dto/change-password.dto.js';
import { ResetPasswordSendEmailDTO } from './dto/reset-password-send-email.dto.js';
import { ResetPasswordDTO } from './dto/reset-password.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Public()
  @Post('/signup')
  async signUp(@Body() dto: CreateUserDTO) {
    const userCreated = await this.authService.create(dto);

    const profileName = userCreated.profile.fullname.split(' ')[0];
    await this.mailService.sendWelcomeEmail(userCreated.email, profileName);
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
  async updateProfile(
    @CurrentUser('id') id: number,
    @Body() dto: UpdateUserDTO,
  ) {
    return this.authService.update(id, dto);
  }

  @Put('/profile/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') id: number,
    @Body() dto: ChangePasswordDTO,
  ) {
    return this.authService.changePassword(id, dto);
  }

  @Public()
  @Post('/password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgot(@Body() body: ResetPasswordSendEmailDTO) {
    const user = await this.authService.findByEmail(body.email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.passwordResetService.request(body.email);
  }

  @Public()
  @Post('/password/reset')
  @HttpCode(HttpStatus.OK)
  async reset(@Body() body: ResetPasswordDTO) {
    const result = await this.passwordResetService.reset(
      body.token,
      body.password,
    );
    if (!result) {
      throw new BadRequestException('O link pode estar inválido ou expirado');
    }
    return { mfaRequired: result.signedIn?.session.mfa === 'pending' };
  }
}

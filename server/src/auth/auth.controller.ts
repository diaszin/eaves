import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';
import { Public } from '@nestjs/authentication';
import { Role } from './entities/user.entity.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  signUp(@Body() dto: CreateUserDTO) {
    const userRole = Role.PATIENT;
    return this.authService.create(dto, userRole);
  }

  @Public()
  @Post('/login')
  signIn(@Body() dto: AuthLoginDTO) {
    return this.authService.login(dto);
  }
}

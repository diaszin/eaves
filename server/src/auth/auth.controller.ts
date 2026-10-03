import { Controller,Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signup")
  signUp(@Body() dto: CreateUserDTO) {
    return this.authService.create(dto);
  }

  @Post("/login")
  signIn(@Body() dto: AuthLoginDTO) {
    return this.authService.login(dto);
  }

}

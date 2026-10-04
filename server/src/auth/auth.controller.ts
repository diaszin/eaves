import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';
import { Public } from '../shared/decorators/auth.decorators.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  signUp(@Body() dto: CreateUserDTO) {
    return this.authService.create(dto);
  }

  @Public()
  @Post('/login')
  signIn(@Body() dto: AuthLoginDTO) {
    return this.authService.login(dto);
  }
}

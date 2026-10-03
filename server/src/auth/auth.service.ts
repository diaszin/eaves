import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  create(createAuthDto: CreateUserDTO) {
    return 'This action adds a new auth';
  }

  login(dto: AuthLoginDTO) {
    return 'This action adds a new auth';
  }
}

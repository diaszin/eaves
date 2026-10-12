import {
  AuthenticationRegistry,
  JwtBearerProvider,
  JwtClaims,
} from '@nestjs/authentication';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtAuth extends JwtBearerProvider<User> {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    registry: AuthenticationRegistry,
  ) {
    super({ realm: 'eaves' });

    registry.registerProvider(this);
  }
  validate({ sub }: JwtClaims) {
    return sub
      ? this.usersRepository.findOneBy({ id: Number.parseInt(sub) })
      : null;
  }
}

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
  async validate({ sub }: JwtClaims) {
    if (!sub) {
      return null;
    }

    const user: User | null = await this.usersRepository.findOneBy({
      id: Number.parseInt(sub),
    });

    return user;
  }
}

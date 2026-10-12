import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Role, User } from './entities/user.entity.js';
import { TokenService } from '@nestjs/authentication';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly tokenService: TokenService,
  ) {}

  async create(createAuthDto: CreateUserDTO, role: Role) {
    try {
      const hashedPassword = this.hashPassword(createAuthDto.password);

      const user = this.users.create({
        email: createAuthDto.email,
        fullname: createAuthDto.fullname,
        birthday: createAuthDto.birthDate,
        password: hashedPassword,
        role: role,
      });
      await this.users.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new BadRequestException(
          'Esse e-mail já foi cadastrado. Faça login ao invés de criar uma nova conta',
        );
      }

      throw error;
    }
  }

  async login(dto: AuthLoginDTO) {
    const user = await this.users.findOneBy({ email: dto.email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = this.comparePassword(dto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Password not matched');
    }

    const token = await this.tokenService.issue(user.id.toString(), {
      method: 'password',
      claims: { amr: ['pwd'] },
    });

    return { access_token: token.accessToken, expires: token.expiresIn };
  }

  private hashPassword(password: string): string {
    const saltRounds = 10;

    return bcrypt.hashSync(password, saltRounds);
  }

  private comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

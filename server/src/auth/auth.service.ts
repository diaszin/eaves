import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateUserDTO) {
    const hashedPassword = this.hashPassword(createAuthDto.password);

    await this.prisma.user.create({
      data: {
        email: createAuthDto.email,
        fullname: createAuthDto.fullname,
        birthday: createAuthDto.birthDate,
        password: hashedPassword,
      },
    });
  }

  async login(dto: AuthLoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = this.comparePassword(dto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Password not matched');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  private hashPassword(password: string): string {
    const saltRounds = 10;

    return bcrypt.hashSync(password, saltRounds);
  }

  private comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create.dto.js';
import { AuthLoginDTO } from './dto/login.dto.js';
import { MicrosoftLoginDTO } from './dto/microsoft-login.dto.js';
import * as bcrypt from 'bcrypt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role, User } from './entities/user.entity.js';
import { TokenService } from '@nestjs/authentication';
import { Profile } from './entities/profile.entity.js';
import { ConfigService } from '@nestjs/config';
import { MicrosoftService } from '../microsoft/microsoft.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly tokenService: TokenService,
    private readonly microsoftService: MicrosoftService,
  ) {}

  async create(createAuthDto: CreateUserDTO, role: Role) {
    const isEmailSigned =
      (await this.users.countBy({
        email: createAuthDto.email,
      })) > 0;

    if (isEmailSigned) {
      throw new BadRequestException(
        'Esse e-mail já foi cadastrado. Faça login ao invés de criar uma nova conta',
      );
    }

    const hashedPassword = this.hashPassword(createAuthDto.password);

    return await this.dataSource.transaction(async (transaction) => {
      const profile = transaction.create(Profile, {
        cep: createAuthDto.cep,
        document: createAuthDto.document,
        emergencyPhone: createAuthDto.emergencyPhone,
        fullname: createAuthDto.fullname,
        incomeBraket: createAuthDto.incomeBraket,
        race: createAuthDto.race,
        birthday: createAuthDto.birthDate,
      });

      const savedProfile = await transaction.save(profile);

      const user = transaction.create(User, {
        email: createAuthDto.email,
        password: hashedPassword,
        role: role,
        profile: savedProfile,
      });

      await transaction.save(user);

      return user;
    });
  }

  async login(dto: AuthLoginDTO) {
    const user = await this.users.findOne({
      where: { email: dto.email },
      relations: { profile: true },
      select: {
        id: true,
        password: true,
        profile: {
          fullname: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = this.comparePassword(dto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Password not matched');
    }

    const token = await this.tokenService.issue(user.id.toString(), {
      method: 'password',
      claims: { amr: ['pwd'], profile: user.profile },
    });

    return { access_token: token.accessToken, expires: token.expiresIn };
  }

  async loginWithMicrosoft(dto: MicrosoftLoginDTO) {
    const microsoftLoginData =
      await this.microsoftService.getMicrosoftExternalData(dto);

    const user = await this.users.findOne({
      where: { email: microsoftLoginData.email },
      relations: { profile: true },
      select: {
        id: true,
        password: true,
        profile: {
          fullname: true,
        },
      },
    });
    if (!user) {
      throw new NotFoundException({
        email: microsoftLoginData.email,
      });
    }

    console.log('Passou aqui');

    const token = await this.tokenService.issue(user.id.toString(), {
      method: 'microsoft',
      claims: { amr: ['microsoft'], profile: user.profile },
    });

    return { access_token: token.accessToken, expires: token.expiresIn };
  }

  findUser(id: number) {
    return this.users.findOneBy({
      id: id,
    });
  }

  private hashPassword(password: string): string {
    const saltRounds = 10;

    return bcrypt.hashSync(password, saltRounds);
  }

  private comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

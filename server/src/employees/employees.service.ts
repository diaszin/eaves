import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../auth/entities/user.entity.js';
import { Profile } from '../auth/entities/profile.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  findEmployeesByRole(role?: string): Promise<User[]> {
    const mappedRole = {
      coordinator: Role.COORDINATOR,
      trainee: Role.TRAINEE,
      lobby: Role.LOBBY,
      professor: Role.PROFESSOR,
      patient: Role.PATIENT,
    }[role ? role.toLowerCase() : 'trainee'];

    return this.userRepository.find({
      where: { role: mappedRole },
      select: {
        id: true,
        profile: {
          fullname: true,
        },
      },
      relations: {
        profile: true,
      },
    });
  }

  async findEmployeeById(id: string) {
    return this.userRepository.findOne({
      where: { id: +id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          fullname: true,
          emergencyPhone: true,
          birthday: true,
        },
      },
      relations: {
        profile: true,
      },
    });
  }
}

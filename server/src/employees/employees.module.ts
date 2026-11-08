import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service.js';
import { EmployeesController } from './employees.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity.js';
import { Profile } from '../auth/entities/profile.entity.js';
import { EmployeesPolicy } from './employees.policy.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesPolicy],
})
export class EmployeesModule {}

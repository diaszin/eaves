import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service.js';
import { EmployeesController } from './employees.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity.js';
import { Profile } from '../auth/entities/profile.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}

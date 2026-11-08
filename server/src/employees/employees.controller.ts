import { Controller, Get, Param, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service.js';
import { Can } from '@nestjs/authorization';
import { EmployeesPolicy } from './employees.policy.js';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Can(EmployeesPolicy, 'view')
  async getEmployeesByRole(@Query('role') role: string) {
    return this.employeesService.findEmployeesByRole(role);
  }

  @Get('/:id')
  @Can(EmployeesPolicy, 'view')
  async getEmployeeById(@Param('id') id: string) {
    return this.employeesService.findEmployeeById(id);
  }
}

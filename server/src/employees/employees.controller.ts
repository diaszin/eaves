import { Controller, Get, Param, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service.js';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getEmployeesByRole(@Query('role') role: string) {
    return this.employeesService.findEmployeesByRole(role);
  }

  @Get("/:id")
  async getEmployeeById(@Param('id') id: string) {
    return this.employeesService.findEmployeeById(id);
  }
}

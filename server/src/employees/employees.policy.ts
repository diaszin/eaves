import { Policy } from '@nestjs/authorization';
import { Role, User } from '../auth/entities/user.entity.js';

@Policy()
export class EmployeesPolicy {
  view(user: User | null) {
    return user?.role === Role.COORDINATOR || user?.role === Role.PROFESSOR;
  }
}

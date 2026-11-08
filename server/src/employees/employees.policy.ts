import { Role, User } from '../auth/entities/user.entity.js';

export class EmployeesPolicy {
  view(user: User | null) {
    return user?.role === Role.COORDINATOR || user?.role === Role.PROFESSOR;
  }
}
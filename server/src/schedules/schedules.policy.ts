import { Policy } from '@nestjs/authorization';
import { Role, User } from '../auth/entities/user.entity.js';

@Policy()
export class SchedulesPolicy {
  view(user: User | null) {
    return (
      user?.role === Role.COORDINATOR ||
      user?.role === Role.PROFESSOR ||
      user?.role === Role.LOBBY ||
      user?.role === Role.TRAINEE
    );
  }

  viewSchedule(user: User | null) {
    return (
      user?.role === Role.COORDINATOR ||
      user?.role === Role.PROFESSOR ||
      user?.role === Role.LOBBY ||
      user?.role === Role.TRAINEE || 
      user?.role === Role.PATIENT
    );
  }

  create(user: User | null) {
    return user?.role === Role.COORDINATOR || user?.role === Role.PROFESSOR;
  }

  update(user: User | null) {
    return user?.role === Role.COORDINATOR || user?.role === Role.PROFESSOR;
  }

  delete(user: User | null) {
    return user?.role === Role.COORDINATOR;
  }
}

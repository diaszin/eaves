import { Policy } from '@nestjs/authorization';
import { Role, User } from '../auth/entities/user.entity.js';

@Policy()
export class AppointmentsPolicy {
  view(user: User | null) {
    return (
      user?.role === Role.PATIENT ||
      user?.role === Role.PROFESSOR ||
      user?.role === Role.COORDINATOR ||
      user?.role === Role.LOBBY ||
      user?.role === Role.TRAINEE
    );
  }

  create(user: User | null) {
    return user?.role === Role.LOBBY || user?.role === Role.COORDINATOR;
  }
}

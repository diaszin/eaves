import { Policy } from '@nestjs/authorization';
import { Role, User } from '../auth/entities/user.entity.js';

@Policy()
export class AppointmentsPolicy {
  view(user: User | null) {
    return user?.role == Role.PATIENT;
  }

  create(user: User | null) {
    return user?.role === Role.LOBBY;
  }
}

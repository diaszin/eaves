import { Policy } from '@nestjs/authorization';
import { Role, User } from '../auth/entities/user.entity.js';

@Policy()
export class GeneralSettingsPolicy {
  view(user: User | null) {
    return (
      user?.role === Role.COORDINATOR ||
      user?.role === Role.PROFESSOR ||
      user?.role === Role.LOBBY ||
      user?.role === Role.TRAINEE
    );
  }

  update(user: User | null) {
    return user?.role === Role.COORDINATOR;
  }
}

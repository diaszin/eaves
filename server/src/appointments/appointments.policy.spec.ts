import { describe, expect, it } from 'vitest';
import { AppointmentsPolicy } from './appointments.policy.js';
import { Role, User } from '../auth/entities/user.entity.js';

const userWithRole = (role: Role) => ({ id: 1, role }) as User;

describe('AppointmentsPolicy.viewProfessionalStats', () => {
  const policy = new AppointmentsPolicy();

  it('permite o coordenador', () => {
    expect(policy.viewProfessionalStats(userWithRole(Role.COORDINATOR))).toBe(
      true,
    );
  });

  it.each([Role.PROFESSOR, Role.LOBBY, Role.TRAINEE, Role.PATIENT])(
    'nega o perfil %s',
    (role) => {
      expect(policy.viewProfessionalStats(userWithRole(role))).toBe(false);
    },
  );

  it('nega usuário nulo', () => {
    expect(policy.viewProfessionalStats(null)).toBe(false);
  });
});

describe('AppointmentsPolicy.cancel', () => {
  const policy = new AppointmentsPolicy();

  it.each([Role.COORDINATOR, Role.LOBBY, Role.PATIENT])(
    'permite o perfil %s',
    (role) => {
      expect(policy.cancel(userWithRole(role))).toBe(true);
    },
  );

  it.each([Role.PROFESSOR, Role.TRAINEE])('nega o perfil %s', (role) => {
    expect(policy.cancel(userWithRole(role))).toBe(false);
  });

  it('nega usuário nulo', () => {
    expect(policy.cancel(null)).toBe(false);
  });
});

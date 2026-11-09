import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity.js';
import { AuthService } from '../auth/auth.service.js';
import { GeneralSettingsService } from '../settings/general-settings.service.js';
import { AppointmentsService } from './appointments.service.js';
import { User } from '../auth/entities/user.entity.js';

describe('AppointmentsService', () => {
  it('uses the configured therapy session duration when creating an appointment', async () => {
    const patient = { id: 2 } as User;
    const createdBy = { id: 1 } as User;
    const appointmentRepository = {
      create: vi.fn((appointment: Partial<Appointment>) => appointment),
      save: vi.fn(async (appointment: Partial<Appointment>) => appointment),
    };
    const userService = {
      findUser: vi.fn().mockResolvedValue(patient),
    };
    const settingsService = {
      get: vi.fn().mockResolvedValue({ therapySessionDurationMinutes: 45 }),
    };
    const service = new AppointmentsService(
      appointmentRepository as unknown as Repository<Appointment>,
      userService as unknown as AuthService,
      settingsService as unknown as GeneralSettingsService,
    );

    const appointment = await service.create({
      initialDate: '2026-10-20T14:00:00.000Z',
      patientId: patient.id,
      createdBy,
    });

    expect(appointment.initialDate).toEqual(
      new Date('2026-10-20T14:00:00.000Z'),
    );
    expect(appointment.endDate).toEqual(new Date('2026-10-20T14:45:00.000Z'));
    expect(settingsService.get).toHaveBeenCalledOnce();
  });
});

import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentsService } from './appointments.service.js';
import { Role } from '../auth/entities/user.entity.js';
import { AppointmentStatus } from './entities/appointment.entity.js';

function setup(rawRows: { month: string; count: string }[] = []) {
  const qb = {
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    getRawMany: vi.fn().mockResolvedValue(rawRows),
  };
  const repository = { createQueryBuilder: vi.fn().mockReturnValue(qb) };
  const authService = { findUser: vi.fn() };
  const service = new AppointmentsService(
    repository as never,
    authService as never,
    {} as never,
  );
  return { service, qb, repository, authService };
}

describe('AppointmentsService.countByMonthForProfessional', () => {
  const now = new Date('2026-11-18T15:00:00Z');
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    ctx = setup([
      { month: '2026-07', count: '3' },
      { month: '2026-11', count: '4' },
    ]);
    ctx.authService.findUser.mockResolvedValue({ id: 5, role: Role.TRAINEE });
  });

  it('retorna 6 meses em ordem crescente, preenchendo meses vazios com 0', async () => {
    const result = await ctx.service.countByMonthForProfessional(5, now);

    expect(result).toEqual([
      { month: '2026-06', count: 0 },
      { month: '2026-07', count: 3 },
      { month: '2026-08', count: 0 },
      { month: '2026-09', count: 0 },
      { month: '2026-10', count: 0 },
      { month: '2026-11', count: 4 },
    ]);
  });

  it('atravessa a virada de ano', async () => {
    const result = await ctx.service.countByMonthForProfessional(
      5,
      new Date('2027-02-10T12:00:00Z'),
    );

    expect(result.map((r) => r.month)).toEqual([
      '2026-09',
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
    ]);
  });

  it('usa o mês de America/Bahia na virada de mês (01/12 01:00 UTC ainda é novembro)', async () => {
    const result = await ctx.service.countByMonthForProfessional(
      5,
      new Date('2026-12-01T01:00:00Z'),
    );

    expect(result.at(-1)?.month).toBe('2026-11');
  });

  it('filtra pelo profissional e pela janela de datas em America/Bahia', async () => {
    await ctx.service.countByMonthForProfessional(5, now);

    expect(ctx.qb.select.mock.calls[0][0]).toContain('America/Bahia');
    expect(ctx.qb.where).toHaveBeenCalledWith('a."professionalId" = :id', {
      id: 5,
    });
    const params = ctx.qb.andWhere.mock.calls.map((c) => c[1]).flat();
    expect(params).toContainEqual({ start: '2026-06-01T00:00:00-03:00' });
    expect(params).toContainEqual({ end: '2026-12-01T00:00:00-03:00' });
  });

  it('não expõe nada além de month e count', async () => {
    const result = await ctx.service.countByMonthForProfessional(5, now);

    for (const item of result) {
      expect(Object.keys(item).sort()).toEqual(['count', 'month']);
    }
  });

  it('lança NotFoundException se o usuário não existe', async () => {
    ctx.authService.findUser.mockResolvedValue(null);

    await expect(
      ctx.service.countByMonthForProfessional(99, now),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(ctx.repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('lança NotFoundException se o usuário não é estagiário', async () => {
    ctx.authService.findUser.mockResolvedValue({ id: 7, role: Role.PROFESSOR });

    await expect(
      ctx.service.countByMonthForProfessional(7, now),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('AppointmentsService.findAll / findAllUnlimited', () => {
  function setupFind() {
    const repository = {
      find: vi.fn().mockResolvedValue([]),
      createQueryBuilder: vi.fn(),
    };
    const service = new AppointmentsService(
      repository as never,
      {} as never,
      {} as never,
    );
    return { service, repository };
  }

  it('findAll mantém o limite de 5 itens', async () => {
    const { service, repository } = setupFind();

    await service.findAll({ id: 1, role: Role.COORDINATOR } as never);

    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 }),
    );
  });

  it('o select inclui o status do agendamento', async () => {
    const { service, repository } = setupFind();

    await service.findAllUnlimited({ id: 1, role: Role.COORDINATOR } as never);

    expect(repository.find.mock.calls[0][0].select).toMatchObject({
      status: true,
    });
  });

  it('findAllUnlimited não aplica limite e mantém a ordenação', async () => {
    const { service, repository } = setupFind();

    await service.findAllUnlimited({ id: 1, role: Role.COORDINATOR } as never);

    const options = repository.find.mock.calls[0][0];
    expect(options).not.toHaveProperty('take');
    expect(options.order).toEqual({ initialDate: 'DESC' });
    expect(options).not.toHaveProperty('where');
  });

  it('paciente só consulta os próprios agendamentos', async () => {
    const { service, repository } = setupFind();

    await service.findAllUnlimited({ id: 9, role: Role.PATIENT } as never);

    expect(repository.find.mock.calls[0][0].where).toEqual({
      patient: { id: 9 },
    });
  });
});

describe('AppointmentsService.cancel', () => {
  const HOUR = 3_600_000;

  function setupCancel(
    appointment: Record<string, unknown> | null,
    affected = 1,
  ) {
    const repository = {
      findOne: vi.fn().mockResolvedValue(appointment),
      update: vi.fn().mockResolvedValue({ affected }),
    };
    const service = new AppointmentsService(
      repository as never,
      {} as never,
      {} as never,
    );
    return { service, repository };
  }

  const future = () => ({
    id: 3,
    status: AppointmentStatus.SCHEDULED,
    endDate: new Date(Date.now() + HOUR),
    patient: { id: 20 },
  });

  it('cancela um agendamento ativo e futuro (coordenador)', async () => {
    const { service, repository } = setupCancel(future());

    const result = await service.cancel(
      { id: 1, role: Role.COORDINATOR } as never,
      3,
    );

    expect(result).toEqual({ id: 3, status: AppointmentStatus.CANCELLED });
    expect(repository.update).toHaveBeenCalledWith(
      { id: 3, status: AppointmentStatus.SCHEDULED },
      { status: AppointmentStatus.CANCELLED },
    );
  });

  it('permite o paciente cancelar o próprio agendamento', async () => {
    const { service } = setupCancel(future());

    const result = await service.cancel(
      { id: 20, role: Role.PATIENT } as never,
      3,
    );

    expect(result.status).toBe(AppointmentStatus.CANCELLED);
  });

  it('recusa o paciente cancelar agendamento de outro paciente', async () => {
    const { service, repository } = setupCancel(future());

    await expect(
      service.cancel({ id: 99, role: Role.PATIENT } as never, 3),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('404 para agendamento inexistente', async () => {
    const { service, repository } = setupCancel(null);

    await expect(
      service.cancel({ id: 1, role: Role.COORDINATOR } as never, 3),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('400 quando já está cancelado', async () => {
    const { service, repository } = setupCancel({
      ...future(),
      status: AppointmentStatus.CANCELLED,
    });

    await expect(
      service.cancel({ id: 1, role: Role.LOBBY } as never, 3),
    ).rejects.toThrow('O agendamento já está cancelado');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('400 quando o agendamento já terminou', async () => {
    const { service, repository } = setupCancel({
      ...future(),
      endDate: new Date(Date.now() - HOUR),
    });

    await expect(
      service.cancel({ id: 1, role: Role.COORDINATOR } as never, 3),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('responde "já cancelado" quando outro usuário cancelou antes (corrida)', async () => {
    const { service } = setupCancel(future(), 0);

    await expect(
      service.cancel({ id: 1, role: Role.COORDINATOR } as never, 3),
    ).rejects.toThrow('O agendamento já está cancelado');
  });
});

describe('AppointmentsService.create (conflito de horário)', () => {
  function setupCreate(conflict: unknown) {
    const repository = {
      findOne: vi.fn().mockResolvedValue(conflict),
      create: vi.fn((value) => value),
      save: vi.fn((value) => Promise.resolve(value)),
    };
    const authService = {
      findByEmail: vi.fn().mockResolvedValue({ id: 20 }),
      findUser: vi.fn().mockResolvedValue({ id: 7 }),
    };
    const settings = {
      getSessionDurationInMinutes: vi.fn().mockResolvedValue(50),
    };
    const service = new AppointmentsService(
      repository as never,
      authService as never,
      settings as never,
    );
    return { service, repository };
  }

  const dto = {
    initialDate: '2030-01-10T14:00:00.000Z',
    patientEmail: 'p@example.com',
    professionalId: 7,
    createdBy: { id: 1 } as never,
  };

  it('considera somente agendamentos ativos na busca de conflito', async () => {
    const { service, repository } = setupCreate(null);

    await service.create(dto);

    expect(repository.findOne.mock.calls[0][0].where).toMatchObject({
      professional: { id: 7 },
      status: AppointmentStatus.SCHEDULED,
    });
  });

  it('salva quando não há conflito ativo', async () => {
    const { service, repository } = setupCreate(null);

    await service.create(dto);

    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('recusa quando há conflito com agendamento ativo', async () => {
    const { service, repository } = setupCreate({ id: 5 });

    await expect(service.create(dto)).rejects.toThrow(
      'O profissional já possui um agendamento nesse horário',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});

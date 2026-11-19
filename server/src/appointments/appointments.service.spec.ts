import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentsService } from './appointments.service.js';
import { Role } from '../auth/entities/user.entity.js';

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

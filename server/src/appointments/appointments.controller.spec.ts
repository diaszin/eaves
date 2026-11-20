import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthorizationModule } from '@nestjs/authorization';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentsController } from './appointments.controller.js';
import { AppointmentsPolicy } from './appointments.policy.js';
import { AppointmentsService } from './appointments.service.js';
import { Role } from '../auth/entities/user.entity.js';

const ROUTE = '/appointments/professionals/7/monthly-count';
const COUNTS = [
  { month: '2026-10', count: 28 },
  { month: '2026-11', count: 24 },
];

describe('AppointmentsController GET professionals/:professionalId/monthly-count', () => {
  let app: INestApplication;
  const service = {
    countByMonthForProfessional: vi.fn(),
    findOneByUser: vi.fn(),
    findAllUnlimited: vi.fn(),
  };

  beforeAll(async () => {
    // O Vitest (esbuild) não emite `design:paramtypes`, que o Nest usa para
    // injetar o serviço no controller; declaramos o metadado manualmente.
    Reflect.defineMetadata('design:paramtypes', [AppointmentsService], AppointmentsController);

    const moduleRef = await Test.createTestingModule({
      imports: [AuthorizationModule.forRoot()],
      controllers: [AppointmentsController],
      providers: [
        AppointmentsPolicy,
        { provide: AppointmentsService, useValue: service },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    // Simula a autenticação: o perfil vem do header `x-test-role`.
    app.use((req: any, _res: unknown, next: () => void) => {
      const role = req.headers['x-test-role'];
      if (role) req.user = { id: 1, role };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    service.countByMonthForProfessional.mockReset().mockResolvedValue(COUNTS);
    service.findOneByUser.mockReset();
    service.findAllUnlimited.mockReset().mockResolvedValue([{ id: 1 }]);
  });

  it('200 para o coordenador, com as contagens do serviço', async () => {
    const res = await request(app.getHttpServer())
      .get(ROUTE)
      .set('x-test-role', Role.COORDINATOR)
      .expect(200);

    expect(res.body).toEqual(COUNTS);
    expect(service.countByMonthForProfessional).toHaveBeenCalledWith(7);
  });

  it.each([Role.PROFESSOR, Role.LOBBY, Role.TRAINEE, Role.PATIENT])(
    '403 para o perfil %s, sem consultar o serviço',
    async (role) => {
      await request(app.getHttpServer())
        .get(ROUTE)
        .set('x-test-role', role)
        .expect(403);

      expect(service.countByMonthForProfessional).not.toHaveBeenCalled();
    },
  );

  it('401 sem usuário autenticado', async () => {
    await request(app.getHttpServer()).get(ROUTE).expect(401);

    expect(service.countByMonthForProfessional).not.toHaveBeenCalled();
  });

  it('400 para professionalId não numérico', async () => {
    await request(app.getHttpServer())
      .get('/appointments/professionals/abc/monthly-count')
      .set('x-test-role', Role.COORDINATOR)
      .expect(400);

    expect(service.countByMonthForProfessional).not.toHaveBeenCalled();
  });

  it('não é tratada pela rota GET :id', async () => {
    await request(app.getHttpServer())
      .get(ROUTE)
      .set('x-test-role', Role.COORDINATOR)
      .expect(200);

    expect(service.findOneByUser).not.toHaveBeenCalled();
  });
});

describe('AppointmentsController GET all', () => {
  let app: INestApplication;
  const service = {
    findAllUnlimited: vi.fn(),
    findOneByUser: vi.fn(),
  };

  beforeAll(async () => {
    Reflect.defineMetadata('design:paramtypes', [AppointmentsService], AppointmentsController);

    const moduleRef = await Test.createTestingModule({
      imports: [AuthorizationModule.forRoot()],
      controllers: [AppointmentsController],
      providers: [
        AppointmentsPolicy,
        { provide: AppointmentsService, useValue: service },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: unknown, next: () => void) => {
      const role = req.headers['x-test-role'];
      if (role) req.user = { id: 1, role };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    service.findAllUnlimited.mockReset().mockResolvedValue([{ id: 1 }, { id: 2 }]);
    service.findOneByUser.mockReset();
  });

  it.each([Role.COORDINATOR, Role.PROFESSOR, Role.LOBBY, Role.TRAINEE, Role.PATIENT])(
    '200 para o perfil %s, delegando a findAllUnlimited',
    async (role) => {
      const res = await request(app.getHttpServer())
        .get('/appointments/all')
        .set('x-test-role', role)
        .expect(200);

      expect(res.body).toHaveLength(2);
      // O usuário vem de @CurrentUser (não resolvido neste módulo de teste);
      // o escopo por papel é coberto em appointments.service.spec.ts.
      expect(service.findAllUnlimited).toHaveBeenCalledTimes(1);
    },
  );

  it('401 sem usuário autenticado', async () => {
    await request(app.getHttpServer()).get('/appointments/all').expect(401);

    expect(service.findAllUnlimited).not.toHaveBeenCalled();
  });

  it('não é capturada pela rota GET :id', async () => {
    await request(app.getHttpServer())
      .get('/appointments/all')
      .set('x-test-role', Role.COORDINATOR)
      .expect(200);

    expect(service.findOneByUser).not.toHaveBeenCalled();
  });
});

describe('AppointmentsController PATCH :id/cancel', () => {
  let app: INestApplication;
  const service = {
    cancel: vi.fn(),
    update: vi.fn(),
    findOneByUser: vi.fn(),
  };

  beforeAll(async () => {
    Reflect.defineMetadata('design:paramtypes', [AppointmentsService], AppointmentsController);

    const moduleRef = await Test.createTestingModule({
      imports: [AuthorizationModule.forRoot()],
      controllers: [AppointmentsController],
      providers: [
        AppointmentsPolicy,
        { provide: AppointmentsService, useValue: service },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: unknown, next: () => void) => {
      const role = req.headers['x-test-role'];
      if (role) req.user = { id: 1, role };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    service.cancel.mockReset().mockResolvedValue({ id: 3, status: 'cancelled' });
    service.update.mockReset();
  });

  it.each([Role.COORDINATOR, Role.LOBBY, Role.PATIENT])(
    '200 para o perfil %s, delegando a cancel',
    async (role) => {
      const res = await request(app.getHttpServer())
        .patch('/appointments/3/cancel')
        .set('x-test-role', role)
        .expect(200);

      expect(res.body).toEqual({ id: 3, status: 'cancelled' });
      expect(service.cancel).toHaveBeenCalledTimes(1);
      expect(service.cancel.mock.calls[0][1]).toBe(3);
    },
  );

  it.each([Role.PROFESSOR, Role.TRAINEE])(
    '403 para o perfil %s, sem chamar o serviço',
    async (role) => {
      await request(app.getHttpServer())
        .patch('/appointments/3/cancel')
        .set('x-test-role', role)
        .expect(403);

      expect(service.cancel).not.toHaveBeenCalled();
    },
  );

  it('401 sem usuário autenticado', async () => {
    await request(app.getHttpServer()).patch('/appointments/3/cancel').expect(401);

    expect(service.cancel).not.toHaveBeenCalled();
  });

  it('400 para id não numérico', async () => {
    await request(app.getHttpServer())
      .patch('/appointments/abc/cancel')
      .set('x-test-role', Role.COORDINATOR)
      .expect(400);

    expect(service.cancel).not.toHaveBeenCalled();
  });

  it('não é capturada pelo PATCH :id genérico', async () => {
    await request(app.getHttpServer())
      .patch('/appointments/3/cancel')
      .set('x-test-role', Role.COORDINATOR)
      .expect(200);

    expect(service.update).not.toHaveBeenCalled();
  });
});

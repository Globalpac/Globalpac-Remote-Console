import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RemotoController } from './remoto.controller';
import { RemotoService } from './remoto.service';
import { RemotoInstaladoresError, RemotoMaquinaError } from './remoto.types';

interface TestRequest {
  headers: { authorization?: string };
  user?: { id: string; isAdmin: boolean };
}

describe('remoto API', () => {
  let app: INestApplication;
  const user = { isAdmin: true };
  const service = {
    list: jest.fn(),
    create: jest.fn(),
    rename: jest.fn(),
    remove: jest.fn(),
    instaladores: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [RemotoController],
      providers: [{ provide: RemotoService, useValue: service }, AdminGuard],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards({
      canActivate(context) {
        const req = context.switchToHttp().getRequest<TestRequest>();
        if (req.headers.authorization !== 'Bearer test-admin') {
          throw new UnauthorizedException();
        }
        req.user = { id: 'admin-id', isAdmin: user.isAdmin };
        return true;
      },
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    user.isAdmin = true;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('requires a session and an administrator', async () => {
    await request(app.getHttpServer()).get('/api/remoto/maquinas').expect(401);
    user.isAdmin = false;
    await request(app.getHttpServer())
      .get('/api/remoto/maquinas')
      .set('Authorization', 'Bearer test-admin')
      .expect(403);
  });

  it('creates a machine and returns the installer links', async () => {
    service.create.mockResolvedValue({
      id: '123456789',
      nome: 'Recepção',
      createdAt: '2026-10-16T12:00:00.000Z',
      updatedAt: '2026-10-16T12:00:00.000Z',
    });
    service.instaladores.mockResolvedValue({
      tag: 'v1.5.2',
      publishedAt: '2026-10-15T17:00:00Z',
      equipe: {
        name: 'Globalpac-1.5.2-x86_64.exe',
        url: 'https://github.com/Globalpac/Globalpac-Remote/releases/download/v1.5.2/Globalpac-1.5.2-x86_64.exe',
      },
      suporte: {
        name: 'Globalpac-Suporte-1.5.2-x86_64.exe',
        url: 'https://github.com/Globalpac/Globalpac-Remote/releases/download/v1.5.2/Globalpac-Suporte-1.5.2-x86_64.exe',
      },
    });

    const created = await request(app.getHttpServer())
      .post('/api/remoto/maquinas')
      .set('Authorization', 'Bearer test-admin')
      .send({ id: '123 456 789', nome: 'Recepção' })
      .expect(201);
    expect(created.body.maquina.id).toBe('123456789');

    const links = await request(app.getHttpServer())
      .get('/api/remoto/instaladores')
      .set('Authorization', 'Bearer test-admin')
      .expect(200);
    expect(links.body.equipe.name).toBe('Globalpac-1.5.2-x86_64.exe');
    expect(links.body.suporte.name).toBe('Globalpac-Suporte-1.5.2-x86_64.exe');
  });

  it('maps duplicate and release failures', async () => {
    service.create.mockRejectedValue(new RemotoMaquinaError('duplicate'));
    service.instaladores.mockRejectedValue(
      new RemotoInstaladoresError('A release latest não tem tag.'),
    );

    const duplicate = await request(app.getHttpServer())
      .post('/api/remoto/maquinas')
      .set('Authorization', 'Bearer test-admin')
      .send({ id: '111', nome: 'Caixa' })
      .expect(409);
    expect(duplicate.body.message).toBe('Já existe uma máquina com este ID.');

    const release = await request(app.getHttpServer())
      .get('/api/remoto/instaladores')
      .set('Authorization', 'Bearer test-admin')
      .expect(502);
    expect(release.body.error).toBe('release_unavailable');
  });
});

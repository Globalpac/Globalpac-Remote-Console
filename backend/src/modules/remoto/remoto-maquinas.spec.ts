import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import * as path from 'path';
import {
  createRemotoMaquina,
  deleteRemotoMaquina,
  listRemotoMaquinas,
  updateRemotoMaquinaNome,
} from './remoto-maquinas';
import { RemotoMaquinaError } from './remoto.types';

const previous = process.env.REMOTO_MAQUINAS_PATH;
let dir = '';

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'remoto-maquinas-'));
  process.env.REMOTO_MAQUINAS_PATH = path.join(dir, 'remoto-maquinas.json');
});

afterEach(async () => {
  if (previous === undefined) delete process.env.REMOTO_MAQUINAS_PATH;
  else process.env.REMOTO_MAQUINAS_PATH = previous;
  await rm(dir, { recursive: true, force: true });
});

describe('remoto maquinas', () => {
  it('creates, lists by name, renames and removes', async () => {
    const now = new Date('2026-10-16T12:00:00.000Z');
    const created = await createRemotoMaquina({
      id: '123 456 789',
      nome: '  Recepção  ',
      now,
    });
    expect(created.id).toBe('123456789');
    expect(created.nome).toBe('Recepção');
    await createRemotoMaquina({ id: '999', nome: 'Arquivo', now });

    const listed = await listRemotoMaquinas();
    expect(listed.map((row) => row.nome)).toEqual(['Arquivo', 'Recepção']);

    const renamed = await updateRemotoMaquinaNome(
      '123456789',
      'Recepção SJC',
      now,
    );
    expect(renamed.nome).toBe('Recepção SJC');
    expect(renamed.createdAt).toBe(created.createdAt);

    await deleteRemotoMaquina('999');
    const left = await listRemotoMaquinas();
    expect(left).toHaveLength(1);
    expect(left[0]?.id).toBe('123456789');
  });

  it('rejects a duplicate id, an empty name and a missing machine', async () => {
    await createRemotoMaquina({ id: '111', nome: 'Caixa' });
    await expect(
      createRemotoMaquina({ id: '111', nome: 'Outra' }),
    ).rejects.toMatchObject({ code: 'duplicate' });
    await expect(
      createRemotoMaquina({ id: '222', nome: '   ' }),
    ).rejects.toBeInstanceOf(RemotoMaquinaError);
    await expect(
      createRemotoMaquina({ id: '../etc', nome: 'X' }),
    ).rejects.toMatchObject({ code: 'invalid_id' });
    await expect(updateRemotoMaquinaNome('000', 'Nome')).rejects.toMatchObject({
      code: 'not_found',
    });
  });
});

import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import * as path from 'path';
import { getDataDir } from '../../common/utils/data-dir.util';
import { RemotoMaquina, RemotoMaquinaError } from './remoto.types';

const ID_RE = /^[0-9A-Za-z_-]{1,64}$/;

let queue: Promise<unknown> = Promise.resolve();

function withMutex<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function maquinasFilePath(): string {
  const override = process.env.REMOTO_MAQUINAS_PATH?.trim();
  if (override) return override;
  return path.join(getDataDir(), 'remoto-maquinas.json');
}

/** Remote-access id. Display spaces (for example "123 456 789") are removed. */
export function normalizeMaquinaId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const id = raw.replace(/\s+/g, '');
  if (!ID_RE.test(id)) return null;
  return id;
}

export function normalizeMaquinaNome(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const nome = raw.trim().replace(/\s+/g, ' ');
  if (nome.length < 1 || nome.length > 120) return null;
  for (let index = 0; index < nome.length; index += 1) {
    const code = nome.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return null;
  }
  return nome;
}

function isMaquina(value: unknown): value is RemotoMaquina {
  if (!value || typeof value !== 'object') return false;
  const row = value as RemotoMaquina;
  return (
    typeof row.id === 'string' &&
    typeof row.nome === 'string' &&
    typeof row.createdAt === 'string' &&
    typeof row.updatedAt === 'string'
  );
}

async function readAll(filePath: string): Promise<RemotoMaquina[]> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(isMaquina);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeAll(
  filePath: string,
  list: RemotoMaquina[],
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(list, null, 2)}\n`, 'utf8');
  await rename(temporary, filePath);
}

export async function listRemotoMaquinas(): Promise<RemotoMaquina[]> {
  const list = await readAll(maquinasFilePath());
  return [...list].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
}

export async function createRemotoMaquina(input: {
  id: unknown;
  nome: unknown;
  now?: Date;
}): Promise<RemotoMaquina> {
  const id = normalizeMaquinaId(input.id);
  if (!id) throw new RemotoMaquinaError('invalid_id');
  const nome = normalizeMaquinaNome(input.nome);
  if (!nome) throw new RemotoMaquinaError('invalid_nome');
  const timestamp = (input.now ?? new Date()).toISOString();

  return withMutex(async () => {
    const filePath = maquinasFilePath();
    const list = await readAll(filePath);
    if (list.some((row) => row.id === id)) {
      throw new RemotoMaquinaError('duplicate');
    }
    const maquina: RemotoMaquina = {
      id,
      nome,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await writeAll(filePath, [...list, maquina]);
    return maquina;
  });
}

export async function updateRemotoMaquinaNome(
  idRaw: unknown,
  nomeRaw: unknown,
  now?: Date,
): Promise<RemotoMaquina> {
  const id = normalizeMaquinaId(idRaw);
  if (!id) throw new RemotoMaquinaError('invalid_id');
  const nome = normalizeMaquinaNome(nomeRaw);
  if (!nome) throw new RemotoMaquinaError('invalid_nome');
  const timestamp = (now ?? new Date()).toISOString();

  return withMutex(async () => {
    const filePath = maquinasFilePath();
    const list = await readAll(filePath);
    const index = list.findIndex((row) => row.id === id);
    const current = index >= 0 ? list[index] : undefined;
    if (!current) throw new RemotoMaquinaError('not_found');
    const next: RemotoMaquina = { ...current, nome, updatedAt: timestamp };
    const copy = [...list];
    copy[index] = next;
    await writeAll(filePath, copy);
    return next;
  });
}

export async function deleteRemotoMaquina(idRaw: unknown): Promise<void> {
  const id = normalizeMaquinaId(idRaw);
  if (!id) throw new RemotoMaquinaError('invalid_id');

  await withMutex(async () => {
    const filePath = maquinasFilePath();
    const list = await readAll(filePath);
    if (!list.some((row) => row.id === id)) {
      throw new RemotoMaquinaError('not_found');
    }
    await writeAll(
      filePath,
      list.filter((row) => row.id !== id),
    );
  });
}

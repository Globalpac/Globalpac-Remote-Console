import { request } from '@umijs/max';

export type RemotoMaquina = {
  id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
};

export type InstaladorLink = {
  name: string;
  url: string;
};

export type RemotoInstaladores = {
  tag: string;
  publishedAt: string | null;
  equipe: InstaladorLink | null;
  suporte: InstaladorLink | null;
};

const skipErrorHandler = true;

export async function listRemotoMaquinas(): Promise<RemotoMaquina[]> {
  const data = await request<{ maquinas?: RemotoMaquina[] }>(
    '/api/remoto/maquinas',
    { method: 'GET', skipErrorHandler },
  );
  return data.maquinas ?? [];
}

export async function createRemotoMaquina(input: {
  id: string;
  nome: string;
}): Promise<RemotoMaquina> {
  const data = await request<{ maquina: RemotoMaquina }>('/api/remoto/maquinas', {
    method: 'POST',
    data: input,
    skipErrorHandler,
  });
  return data.maquina;
}

export async function updateRemotoMaquinaNome(
  id: string,
  nome: string,
): Promise<RemotoMaquina> {
  const data = await request<{ maquina: RemotoMaquina }>(
    `/api/remoto/maquinas/${encodeURIComponent(id)}`,
    { method: 'PUT', data: { nome }, skipErrorHandler },
  );
  return data.maquina;
}

export async function deleteRemotoMaquina(id: string): Promise<void> {
  await request(`/api/remoto/maquinas/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    skipErrorHandler,
  });
}

export async function getRemotoInstaladores(): Promise<RemotoInstaladores> {
  const data = await request<RemotoInstaladores>('/api/remoto/instaladores', {
    method: 'GET',
    skipErrorHandler,
  });
  return {
    tag: data.tag,
    publishedAt: data.publishedAt,
    equipe: data.equipe,
    suporte: data.suporte,
  };
}

export function remotoErrorMessage(error: unknown, fallback: string): string {
  const data = (
    error as { response?: { data?: { message?: unknown } } } | null
  )?.response?.data;
  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

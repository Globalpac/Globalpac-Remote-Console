import { beforeEach, expect, jest, test } from '@jest/globals';
import { request } from '@umijs/max';
import {
  createRemotoMaquina,
  deleteRemotoMaquina,
  getRemotoInstaladores,
  listRemotoMaquinas,
  remotoErrorMessage,
  updateRemotoMaquinaNome,
} from './remoto';

jest.mock('@umijs/max', () => ({ request: jest.fn() }));

const requestMock = jest.mocked(request);

beforeEach(() => {
  requestMock.mockReset();
});

test('calls the console machine and installer endpoints', async () => {
  requestMock
    .mockResolvedValueOnce({ maquinas: [] })
    .mockResolvedValueOnce({ maquina: { id: '123456789', nome: 'Recepção' } })
    .mockResolvedValueOnce({ maquina: { id: '123456789', nome: 'SJC' } })
    .mockResolvedValueOnce({ ok: true })
    .mockResolvedValueOnce({
      tag: 'v1.5.2',
      publishedAt: null,
      equipe: { name: 'Globalpac-1.5.2-x86_64.exe', url: 'https://example/a' },
      suporte: {
        name: 'Globalpac-Suporte-1.5.2-x86_64.exe',
        url: 'https://example/b',
      },
    });

  await listRemotoMaquinas();
  await createRemotoMaquina({ id: '123 456 789', nome: 'Recepção' });
  await updateRemotoMaquinaNome('123456789', 'SJC');
  await deleteRemotoMaquina('123456789');
  const links = await getRemotoInstaladores();

  expect(requestMock).toHaveBeenNthCalledWith(1, '/api/remoto/maquinas', {
    method: 'GET',
    skipErrorHandler: true,
  });
  expect(requestMock).toHaveBeenNthCalledWith(2, '/api/remoto/maquinas', {
    method: 'POST',
    data: { id: '123 456 789', nome: 'Recepção' },
    skipErrorHandler: true,
  });
  expect(requestMock).toHaveBeenNthCalledWith(
    3,
    '/api/remoto/maquinas/123456789',
    { method: 'PUT', data: { nome: 'SJC' }, skipErrorHandler: true },
  );
  expect(requestMock).toHaveBeenNthCalledWith(
    4,
    '/api/remoto/maquinas/123456789',
    { method: 'DELETE', skipErrorHandler: true },
  );
  expect(links.equipe?.name).toBe('Globalpac-1.5.2-x86_64.exe');
  expect(links.suporte?.name).toBe('Globalpac-Suporte-1.5.2-x86_64.exe');
});

test('reads the API message from a failed response', () => {
  const error = { response: { data: { message: 'ID inválido.' } } };
  expect(remotoErrorMessage(error, 'fallback')).toBe('ID inválido.');
  expect(remotoErrorMessage(new Error(''), 'fallback')).toBe('fallback');
});

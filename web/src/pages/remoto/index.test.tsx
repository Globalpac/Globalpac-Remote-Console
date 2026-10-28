import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import React from 'react';
import RemotoPage from './index';

jest.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({
      id,
      defaultMessage,
    }: {
      id: string;
      defaultMessage?: string;
    }) => defaultMessage || id,
  }),
}));

jest.mock('@/services/rustdesk-console/remoto', () => ({
  listRemotoMaquinas: jest.fn(),
  getRemotoInstaladores: jest.fn(),
  createRemotoMaquina: jest.fn(),
  updateRemotoMaquinaNome: jest.fn(),
  deleteRemotoMaquina: jest.fn(),
  remotoErrorMessage: (_error: unknown, fallback: string) => fallback,
}));

const api = jest.requireMock('@/services/rustdesk-console/remoto') as {
  listRemotoMaquinas: { mockResolvedValue: (value: unknown) => void };
  getRemotoInstaladores: { mockResolvedValue: (value: unknown) => void };
};

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

test('shows the machine list and both installer links', async () => {
  api.listRemotoMaquinas.mockResolvedValue([
    {
      id: '123456789',
      nome: 'Recepção',
      createdAt: '2026-10-16T12:00:00.000Z',
      updatedAt: '2026-10-16T12:00:00.000Z',
    },
  ]);
  api.getRemotoInstaladores.mockResolvedValue({
    tag: 'v1.5.2',
    publishedAt: null,
    equipe: {
      name: 'Globalpac-1.5.2-x86_64.exe',
      url: 'https://github.com/Globalpac/Globalpac-Remote/releases/download/v1.5.2/Globalpac-1.5.2-x86_64.exe',
    },
    suporte: {
      name: 'Globalpac-Suporte-1.5.2-x86_64.exe',
      url: 'https://github.com/Globalpac/Globalpac-Remote/releases/download/v1.5.2/Globalpac-Suporte-1.5.2-x86_64.exe',
    },
  });

  render(React.createElement(App, null, React.createElement(RemotoPage)));

  expect(
    await screen.findByText('Globalpac-1.5.2-x86_64.exe'),
  ).toBeTruthy();
  expect(
    screen.getByText('Globalpac-Suporte-1.5.2-x86_64.exe'),
  ).toBeTruthy();
  expect(screen.getByText('Recepção')).toBeTruthy();
  const equipe = document.querySelector(
    'a[href*="Globalpac-1.5.2-x86_64.exe"]',
  );
  const suporte = document.querySelector(
    'a[href*="Globalpac-Suporte-1.5.2-x86_64.exe"]',
  );
  expect(equipe?.textContent).toContain('Baixar');
  expect(suporte?.textContent).toContain('Baixar');
  await waitFor(() => {
    expect(api.listRemotoMaquinas).toHaveBeenCalled();
  });
});

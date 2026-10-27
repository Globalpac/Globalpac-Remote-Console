import {
  clearInstaladoresCache,
  loadLatestInstaladores,
  pickInstaladorAssets,
} from './remoto-instaladores';
import { RemotoInstaladoresError } from './remoto.types';

afterEach(() => {
  clearInstaladoresCache();
});

describe('pickInstaladorAssets', () => {
  it('separates the team client from the support client', () => {
    const picked = pickInstaladorAssets([
      {
        name: 'Globalpac-Suporte-1.5.2-x86_64.exe',
        browser_download_url:
          'https://github.com/Globalpac/Globalpac-Remote/releases/download/v1.5.2/Globalpac-Suporte-1.5.2-x86_64.exe',
      },
      {
        name: 'Globalpac-1.5.2-x86_64.exe',
        browser_download_url:
          'https://github.com/Globalpac/Globalpac-Remote/releases/download/v1.5.2/Globalpac-1.5.2-x86_64.exe',
      },
      {
        name: 'notes.txt',
        browser_download_url: 'https://example.com/notes.txt',
      },
    ]);
    expect(picked.equipe?.name).toBe('Globalpac-1.5.2-x86_64.exe');
    expect(picked.suporte?.name).toBe('Globalpac-Suporte-1.5.2-x86_64.exe');
  });

  it('ignores a URL that is not https', () => {
    const picked = pickInstaladorAssets([
      {
        name: 'Globalpac-1.5.2-x86_64.exe',
        browser_download_url: 'http://example.com/a.exe',
      },
    ]);
    expect(picked.equipe).toBeNull();
    expect(picked.suporte).toBeNull();
  });
});

describe('loadLatestInstaladores', () => {
  it('reads the latest release and reuses the cache', async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = () => {
      calls += 1;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            tag_name: 'v1.5.2',
            published_at: '2026-10-15T17:00:00Z',
            assets: [
              {
                name: 'Globalpac-1.5.2-x86_64.exe',
                browser_download_url:
                  'https://github.com/Globalpac/Globalpac-Remote/releases/download/v1.5.2/Globalpac-1.5.2-x86_64.exe',
              },
              {
                name: 'Globalpac-Suporte-1.5.2-x86_64.exe',
                browser_download_url:
                  'https://github.com/Globalpac/Globalpac-Remote/releases/download/v1.5.2/Globalpac-Suporte-1.5.2-x86_64.exe',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    };
    let now = 1_000;
    const first = await loadLatestInstaladores({
      fetchImpl,
      now: () => now,
      repo: 'Globalpac/Globalpac-Remote',
    });
    now = 20_000;
    const second = await loadLatestInstaladores({
      fetchImpl,
      now: () => now,
      repo: 'Globalpac/Globalpac-Remote',
    });
    expect(calls).toBe(1);
    expect(first.tag).toBe('v1.5.2');
    expect(second.equipe?.name).toBe('Globalpac-1.5.2-x86_64.exe');
    expect(second.suporte?.name).toBe('Globalpac-Suporte-1.5.2-x86_64.exe');
  });

  it('fails when the release does not respond', async () => {
    const fetchImpl: typeof fetch = () =>
      Promise.resolve(new Response('nope', { status: 404 }));
    await expect(
      loadLatestInstaladores({
        fetchImpl,
        repo: 'Globalpac/Globalpac-Remote',
      }),
    ).rejects.toBeInstanceOf(RemotoInstaladoresError);
  });
});

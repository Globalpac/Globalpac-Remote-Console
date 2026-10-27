import {
  InstaladorLink,
  InstaladoresPayload,
  RemotoInstaladoresError,
} from './remoto.types';

const DEFAULT_REPO = 'Globalpac/Globalpac-Remote';
const CACHE_MS = 60_000;
const SUPORTE_RE = /^Globalpac-Suporte-.+\.exe$/i;
const EQUIPE_RE = /^Globalpac-.+\.exe$/i;

type ReleaseAsset = {
  name?: string;
  browser_download_url?: string;
};

let cache: { at: number; repo: string; payload: InstaladoresPayload } | null =
  null;

/**
 * Installer links come only from the latest GitHub release.
 * The console does not call the Admin API for the same links.
 */
export function remotoReleaseRepo(): string {
  const raw = process.env.REMOTO_RELEASE_REPO?.trim() || DEFAULT_REPO;
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(raw)) return DEFAULT_REPO;
  return raw;
}

export function clearInstaladoresCache(): void {
  cache = null;
}

export function pickInstaladorAssets(assets: ReleaseAsset[]): {
  equipe: InstaladorLink | null;
  suporte: InstaladorLink | null;
} {
  let equipe: InstaladorLink | null = null;
  let suporte: InstaladorLink | null = null;
  for (const asset of assets) {
    const name = typeof asset.name === 'string' ? asset.name.trim() : '';
    const url =
      typeof asset.browser_download_url === 'string'
        ? asset.browser_download_url.trim()
        : '';
    if (!name || !url.startsWith('https://')) continue;
    if (SUPORTE_RE.test(name)) {
      if (!suporte) suporte = { name, url };
      continue;
    }
    if (EQUIPE_RE.test(name) && !equipe) equipe = { name, url };
  }
  return { equipe, suporte };
}

export async function loadLatestInstaladores(options?: {
  fetchImpl?: typeof fetch;
  now?: () => number;
  repo?: string;
}): Promise<InstaladoresPayload> {
  const repo = options?.repo ?? remotoReleaseRepo();
  const now = options?.now ?? Date.now;
  const at = now();
  if (cache && cache.repo === repo && at - cache.at < CACHE_MS) {
    return cache.payload;
  }

  const fetchImpl = options?.fetchImpl ?? fetch;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'globalpac-remote-console',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token =
    process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetchImpl(
      `https://api.github.com/repos/${repo}/releases/latest`,
      {
        headers,
        signal: AbortSignal.timeout(8_000),
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'falha de rede';
    throw new RemotoInstaladoresError(
      `Não foi possível ler a release latest: ${message}`,
    );
  }

  if (!response.ok) {
    throw new RemotoInstaladoresError(
      `A release latest de ${repo} respondeu ${response.status}.`,
    );
  }

  const body = (await response.json()) as {
    tag_name?: unknown;
    published_at?: unknown;
    assets?: unknown;
  };
  const tag = typeof body.tag_name === 'string' ? body.tag_name : '';
  if (!tag) throw new RemotoInstaladoresError('A release latest não tem tag.');
  const assets = Array.isArray(body.assets)
    ? (body.assets as ReleaseAsset[])
    : [];
  const picked = pickInstaladorAssets(assets);
  const payload: InstaladoresPayload = {
    tag,
    publishedAt:
      typeof body.published_at === 'string' ? body.published_at : null,
    equipe: picked.equipe,
    suporte: picked.suporte,
  };
  cache = { at, repo, payload };
  return payload;
}

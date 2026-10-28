export type RemotoMaquina = {
  id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
};

export type RemotoMaquinaCode =
  'invalid_id' | 'invalid_nome' | 'duplicate' | 'not_found';

export class RemotoMaquinaError extends Error {
  readonly code: RemotoMaquinaCode;

  constructor(code: RemotoMaquinaCode) {
    super(code);
    this.name = 'RemotoMaquinaError';
    this.code = code;
  }
}

export type InstaladorLink = {
  name: string;
  url: string;
};

export type InstaladoresPayload = {
  tag: string;
  publishedAt: string | null;
  equipe: InstaladorLink | null;
  suporte: InstaladorLink | null;
};

export class RemotoInstaladoresError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RemotoInstaladoresError';
  }
}

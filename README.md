# Globalpac Console

Console web de administração do acesso remoto da Globalpac. É um fork AGPL-3.0 de [databk/rustdesk-console](https://github.com/databk/rustdesk-console) e [databk/rustdesk-console-web](https://github.com/databk/rustdesk-console-web). Veja [NOTICE.md](NOTICE.md).

- `backend/` — API NestJS
- `web/` — interface

A conta criada num banco vazio é `globalpac` / `console@globalpac.com.br`. A senha vem de `ADMIN_PASSWORD`. Sem essa variável, a senha inicial é `globalpac` e deve ser trocada no primeiro acesso.

O idioma padrão é português (`pt-BR`). A marca d'água da tela é o nome do usuário logado.

## Subir

```bash
cp .env.example .env
# JWT_SECRET e ADMIN_PASSWORD
docker compose up -d --build
```

A interface fica na porta 21114. Este compose não sobe `hbbs` nem `hbbr`.

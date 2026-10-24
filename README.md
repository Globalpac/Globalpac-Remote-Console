# Globalpac Console

Console web de administração do acesso remoto da Globalpac. É um fork AGPL-3.0 de [databk/rustdesk-console](https://github.com/databk/rustdesk-console) e [databk/rustdesk-console-web](https://github.com/databk/rustdesk-console-web). Veja [NOTICE.md](NOTICE.md).

- `backend/` — API NestJS
- `web/` — interface

Num banco vazio é criada uma conta de administrador. Defina a senha em `ADMIN_PASSWORD` antes do primeiro arranque e troque-a no primeiro acesso.

O idioma padrão é português (`pt-BR`). A marca d'água da tela é o nome do usuário logado.

## Subir

```bash
cp .env.example .env
# JWT_SECRET e ADMIN_PASSWORD
docker compose up -d --build
```

A interface fica na porta 21114. Este compose não sobe `hbbs` nem `hbbr`.

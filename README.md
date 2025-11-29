# sistema-coleta-backend

Este repositório contém a API backend do sistema de coleta (Express + TypeScript + Prisma).

## Executar localmente (dev)

1. Instale dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz com as variáveis mínimas para desenvolvimento:

```
DATABASE_URL="postgresql://rmr_coleta_user:senha@host:porta/banco"
JWT_SECRET="algum-segredo-local"
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:3000"
```

3. Rodar seed (popular banco):

```bash
npx prisma db seed
```

4. Iniciar em modo dev:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3000`.

## Testes rápidos (curl)

- Fazer login (verifica formato de resposta { user, accessToken }):

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq
```

- Listar escolas (exemplo de endpoint):

```bash
curl http://localhost:3000/escolas | jq
```

## Deploy no Render (ou outro provider)

Para colocar esta API no ar e conectar a base de dados externa, configure uma nova Service (Web Service) no Render com estas definições mínimas:

- Build Command: `npm install && npx prisma generate`
- Start Command: `npm run dev` (ou um comando de produção que você preferir)
- Environment: `Node 18+`

Defina estas variáveis de ambiente no painel do Render:

- `DATABASE_URL` — URL de conexão com Postgres (o que você me forneceu):
  `postgresql://rmr_coleta_user:e1trJMuoLXMhrjDhIjMbdMSOIcNkUxk1@dpg-d4gfqindiees73as9rn0-a.oregon-postgres.render.com/rmr_coleta`

- `JWT_SECRET` — um segredo forte (não compartilhe publicamente). Ex: gerar via `openssl rand -base64 32`.

- `FRONTEND_URL` — URL pública do frontend (ex: `https://seu-frontend.onrender.com`).

- `API_URL` — URL pública do backend (ex: `https://seu-backend.onrender.com`).

Observações:

- O `prisma/schema.prisma` foi alterado para usar `env("DATABASE_URL")` (em vez de um URL hardcoded) — garanta que `DATABASE_URL` esteja definido no ambiente do Render.
- Depois de configurar `DATABASE_URL` no Render, rode `npx prisma db push` ou configure `prisma migrate` conforme seu fluxo para aplicar o schema (ou rode o seed se necessário).

## Segurança e boas práticas

- Nunca publique seu `JWT_SECRET` ou `DATABASE_URL` contendo credenciais em repositórios públicos.
- Use `ENV` vars do Render (ou secret manager) para esconder segredos.
- Em produção prefira rodar o build (compilar TypeScript) e iniciar `node dist/server.js` em vez de `ts-node`.

## Contato

Se quiser, eu posso ajudar a adicionar o `service` do Render (criar `render.yaml`), scripts de deploy, e um pequeno workflow de GitHub Actions para CI/CD.

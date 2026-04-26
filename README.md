# FinFlow

Controle financeiro pessoal — gerencie transações, contas, cartões e visualize relatórios do seu dinheiro em um só lugar.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=0f172a)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-f69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-ef4444?logo=turborepo&logoColor=white)](https://turbo.build/)

## Recursos

- **Transações** — lançamentos de receitas, despesas, transferências, parcelas e recorrências
- **Contas** — contas correntes, poupança e carteira
- **Relatórios** — gráficos de evolução patrimonial, gastos por categoria e fluxo de caixa
- **Autenticação** — e-mail/senha e Google OAuth

## Estrutura do repositório

Monorepo gerenciado com [pnpm workspaces](https://pnpm.io/workspaces) e [Turborepo](https://turbo.build).

```
finflow-apps/
├── apps/
│   ├── api/        # API REST (Fastify + Prisma + PostgreSQL)
│   └── web/        # SPA (React + Vite + TanStack Router)
└── packages/
    └── ui/         # Biblioteca de componentes compartilhados (shadcn/ui)
```

## Stack

### API (`apps/api`)

| Camada         | Tecnologia                                    |
| -------------- | --------------------------------------------- |
| Runtime        | Node.js 20+, TypeScript, ESM                  |
| Framework      | Fastify 5                                     |
| Banco de dados | PostgreSQL 17 via Prisma 7                    |
| Autenticação   | JWT (httpOnly cookie) + Argon2 + Google OAuth |
| Validação      | Zod 4 + fastify-type-provider-zod             |
| Documentação   | Swagger UI em `/docs`                         |

### Web (`apps/web`)

| Camada        | Tecnologia                                  |
| ------------- | ------------------------------------------- |
| Framework     | React 19 + Vite 7                           |
| Roteamento    | TanStack Router (file-based)                |
| Data fetching | TanStack React Query 5                      |
| Formulários   | react-hook-form + Zod + @hookform/resolvers |
| Estado global | Zustand                                     |
| HTTP          | ky (cookies httpOnly)                       |
| Estilização   | Tailwind CSS 4                              |

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker (para o PostgreSQL)

## Primeiros passos

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir o banco de dados
docker compose -f apps/api/docker-compose.yml up -d

# 3. Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Executar as migrations
pnpm --filter @finflow/api db:migrate

# 5. Iniciar todos os serviços em modo de desenvolvimento
pnpm dev
```

A API estará disponível em `http://localhost:3333` e o frontend em `http://localhost:5173`.

## Variáveis de ambiente

### API (`apps/api/.env`)

| Variável           | Obrigatória                 | Descrição                     |
| ------------------ | --------------------------- | ----------------------------- |
| `DATABASE_URL`     | Sim                         | String de conexão PostgreSQL  |
| `JWT_SECRET`       | Sim                         | Segredo para assinar os JWTs  |
| `GOOGLE_CLIENT_ID` | Sim                         | Client ID do Google OAuth     |
| `PORT`             | Não (padrão: `3333`)        | Porta do servidor             |
| `NODE_ENV`         | Não (padrão: `development`) | `development` ou `production` |

### Web (`apps/web/.env`)

| Variável                | Obrigatória                           | Descrição                 |
| ----------------------- | ------------------------------------- | ------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | Sim                                   | Client ID do Google OAuth |
| `VITE_API_URL`          | Não (padrão: `http://localhost:3333`) | URL base da API           |

## Scripts disponíveis

```bash
pnpm dev                                      # Inicia todos os apps em desenvolvimento
pnpm build                                    # Build de todos os apps
pnpm lint                                     # Lint em todos os apps
pnpm typecheck                                # Verificação de tipos em todos os apps

pnpm --filter @finflow/api dev                # Somente a API
pnpm --filter web dev                         # Somente o frontend
pnpm --filter @finflow/api db:migrate         # Executar migrations
pnpm --filter @finflow/api db:studio          # Abrir Prisma Studio
```

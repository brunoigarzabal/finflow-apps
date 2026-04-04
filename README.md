# FinFlow

Controle financeiro pessoal — gerencie transações, contas, cartões e visualize relatórios do seu dinheiro em um só lugar.

## Funcionalidades planejadas

- **Transações** — lançamentos de receitas e despesas, com categorias e tags
- **Contas** — contas correntes, poupança e carteira
- **Cartões de crédito** — controle de faturas e limite
- **Relatórios** — gráficos de evolução patrimonial, gastos por categoria e fluxo de caixa
- **Orçamentos** — metas de gastos por categoria
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

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20+, TypeScript, ESM |
| Framework | Fastify 5 |
| Banco de dados | PostgreSQL 17 via Prisma 7 |
| Autenticação | JWT (httpOnly cookie) + Argon2 + Google OAuth |
| Validação | Zod 4 + fastify-type-provider-zod |
| Documentação | Swagger UI em `/docs` |

### Web (`apps/web`)

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + Vite 7 |
| Roteamento | TanStack Router (file-based) |
| Data fetching | TanStack React Query 5 |
| Formulários | react-hook-form + Zod + @hookform/resolvers |
| Estado global | Zustand |
| HTTP | ky (cookies httpOnly) |
| Estilização | Tailwind CSS 4 |

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

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexão PostgreSQL |
| `JWT_SECRET` | Sim | Segredo para assinar os JWTs |
| `GOOGLE_CLIENT_ID` | Sim | Client ID do Google OAuth |
| `PORT` | Não (padrão: `3333`) | Porta do servidor |
| `NODE_ENV` | Não (padrão: `development`) | `development` ou `production` |

### Web (`apps/web/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Sim | Client ID do Google OAuth |
| `VITE_API_URL` | Não (padrão: `http://localhost:3333`) | URL base da API |

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

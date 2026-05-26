# Personal Budget v2

Personal Budget v2 e uma aplicacao full-stack para controle financeiro pessoal. O projeto combina dashboard, lancamento de receitas e despesas, parcelamentos, pagamentos recorrentes, metodos de pagamento, relatorios e administracao de usuarios em uma interface responsiva.

Live demo: https://personalbudget.co.uk

## Visao Geral

- Frontend em React 18, TypeScript e Vite, com Chakra UI, Recharts, Framer Motion e icones Lucide/Phosphor.
- Backend em Spring Boot 3.3, Java 17, Spring Security, JWT, Spring Data JPA, Flyway e PostgreSQL.
- Cache com Redis para listas e resumos financeiros.
- Deploy containerizado com Docker, Docker Compose e Nginx.
- Autenticacao por email/senha e Google Sign-In, com fluxo de aprovacao por administrador.

## Principais Funcionalidades

- Dashboard financeiro com resumo de receitas, despesas, saldo e navegacao por dia, semana, mes e ano.
- Cadastro, edicao, exclusao e busca de transacoes por texto, tipo, categoria e periodo.
- Lancamento rapido de receita ou despesa com formulario otimizado, number pad e categorias.
- Controle de parcelamentos com geracao automatica de parcelas mensais e historico de planos.
- Pagamentos fixos/recorrentes com geracao agendada de transacoes e cancelamento preservando historico.
- Metodos de pagamento por usuario: dinheiro, debito, credito e transferencia bancaria.
- Calculo de data de impacto financeiro para cartao de credito usando dia de fechamento e dia de pagamento.
- Importacao de transacoes por CSV com validacao por linha, preview e download de template.
- Exportacao de transacoes em CSV.
- Relatorios por dia, semana, mes ou ano com KPIs, insights, categorias, metodos de pagamento e exportacao PDF.
- Analise por categorias para receitas e despesas, com graficos e breakdowns.
- Secao Discover com insights financeiros, alertas e cards de analise.
- Painel administrativo para aprovar cadastros, rejeitar/remover usuarios e alternar planos Standard/Premium.
- Tema claro/escuro, layout responsivo, landing page e modais premium.
- Health check em `/health` e documentacao OpenAPI via Springdoc quando habilitada.

## Stack Tecnica

### Frontend

- React 18 + TypeScript
- Vite 5
- Chakra UI + Emotion
- Recharts
- Framer Motion
- Axios
- Zod
- Lucide React, Phosphor Icons e React Icons

### Backend

- Java 17
- Spring Boot 3.3
- Spring Web
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL 16
- Flyway
- Redis + Spring Cache
- Springdoc OpenAPI
- Google API Client para Google Sign-In
- Apache PDFBox para geracao de PDF
- JUnit/Spring Boot Test

### Infra e Deploy

- Docker e Docker Compose
- Nginx para servir o frontend e fazer proxy de `/api`
- Vercel config para frontend
- Scripts auxiliares para VPS, Nginx e SSL

## Arquitetura

```text
frontend/                 React + TypeScript + Vite
  src/pages/              Dashboard, transacoes, categorias, relatorios, admin e landing
  src/components/         UI, layout, auth, transacoes, charts, search e user
  src/sections/           Blocos principais do dashboard
  src/hooks/              Dados, filtros, periodo, insights e categorias
  src/contexts/           AuthContext e SearchContext

backend/                  API Spring Boot
  src/main/java/.../controller
  src/main/java/.../service
  src/main/java/.../repository
  src/main/java/.../model
  src/main/resources/db/migration

docs/                     Documentacao tecnica complementar
docker-compose*.yml       Ambientes local, dev e producao
```

Fluxo resumido:

1. O usuario acessa a landing page ou autentica pelo modal.
2. O frontend armazena o JWT e envia `Authorization: Bearer <token>` nas chamadas Axios.
3. O backend valida o token, isola dados por usuario e persiste em PostgreSQL.
4. Flyway mantem o schema versionado e Redis acelera listas/resumos.
5. Nginx serve o build do frontend e encaminha `/api` para o backend em ambiente Docker.

## Como Rodar com Docker

Crie um arquivo `.env` a partir do exemplo:

```bash
cp env.example .env
```

Preencha pelo menos:

```env
DB_NAME=personalbudget
DB_USER=postgres
DB_PASSWORD=change-me
JWT_SECRET=change-me
JWT_EXPIRATION=86400000
GOOGLE_OAUTH_CLIENT_ID=
VITE_GOOGLE_CLIENT_ID=
REDIS_HOST=redis
REDIS_PORT=6379
```

Suba o ambiente de desenvolvimento:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Servicos principais:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Para parar:

```bash
docker compose -f docker-compose.dev.yml down
```

## Desenvolvimento Local

### Backend

Requisitos: Java 17, Maven, PostgreSQL e Redis.

```bash
cd backend
mvn spring-boot:run
```

O backend usa as variaveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION`, `REDIS_HOST`, `REDIS_PORT` e `GOOGLE_OAUTH_CLIENT_ID`.

### Frontend

Requisitos: Node.js 18+ e npm.

```bash
cd frontend
npm install
npm run dev
```

Por padrao, o frontend usa `/api` e o Vite faz proxy para o backend. Se apontar diretamente para uma API externa, use `VITE_API_URL` incluindo o prefixo `/api`, por exemplo:

```env
VITE_API_URL=http://localhost:8080/api
```

## Scripts Uteis

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

Backend:

```bash
mvn test
mvn clean verify
mvn spring-boot:run
```

Docker:

```bash
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.prod.yml up -d --build
```

## API Principal

Todas as rotas abaixo exigem JWT, exceto `/api/auth/**` e `/health`.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/{id}`
- `DELETE /api/transactions/{id}`
- `GET /api/transactions/search`
- `POST /api/transactions/import`
- `GET /api/transactions/export`
- `GET /api/summary/month`
- `GET /api/payment-methods`
- `POST /api/payment-methods`
- `PUT /api/payment-methods/{id}`
- `DELETE /api/payment-methods/{id}`
- `GET /api/installment-plans`
- `POST /api/installment-plans`
- `PUT /api/installment-plans/{id}`
- `DELETE /api/installment-plans/{id}`
- `GET /api/recurring-transactions`
- `POST /api/recurring-transactions`
- `PATCH /api/recurring-transactions/{id}/amount`
- `PUT /api/recurring-transactions/{id}`
- `DELETE /api/recurring-transactions/{id}`
- `GET /api/reports`
- `GET /api/reports/pdf`
- `GET /api/admin/users`
- `PATCH /api/admin/users/{id}/approve`
- `PATCH /api/admin/users/{id}/plan`
- `DELETE /api/admin/users/{id}`
- `GET /health`

Mais detalhes em [docs/API.md](docs/API.md).

## Banco de Dados

O schema e versionado com Flyway em `backend/src/main/resources/db/migration`.

Entidades principais:

- `users`
- `transactions`
- `installment_plan`
- `recurring_transactions`
- `payment_methods`

O modelo separa `transaction_date` da `payment_date`, permitindo que compras no cartao impactem o orcamento na data correta da fatura.

## Testes

O backend possui testes de servico para autenticacao, transacoes, parcelamentos, pagamentos recorrentes, relatorios e calculo de fatura de cartao:

```bash
cd backend
mvn test
```

O Dockerfile do backend executa `mvn clean verify` por padrao durante o build. Para builds locais mais rapidos:

```bash
docker build --build-arg SKIP_TESTS=true ./backend
```

## Documentacao Complementar

- [Arquitetura](docs/ARCHITECTURE.md)
- [Backend](docs/BACKEND.md)
- [Frontend](docs/FRONTEND.md)
- [API](docs/API.md)
- [Deploy](docs/DEPLOYMENT.md)
- [Docker](DOCKER_README.md)
- [Deploy README](README_DEPLOY.md)
- [Vercel](VERCEL_CONFIG.md)
- [VPS](VPS_SETUP.md)
- [Parcelamentos](backend/INSTALLMENT_PLANS_README.md)
- [Performance](backend/PERFORMANCE_ANALYSIS.md)
- [Profiles](backend/PROFILES_README.md)
- [PostgreSQL](backend/POSTGRESQL_SETUP.md)

## Screenshots

![Landing page](landingPage.jpg)

![Dashboard light](dashboard_V1.jpg)

![Dashboard dark](dashboard_V1_dark.jpg)

## Licenca

MIT - veja [LICENSE](LICENSE).

# Architecture

## System overview
- **Frontend**: React + TypeScript (Vite) served by Nginx in production. Auth flow handled in `frontend/src/contexts/AuthContext.tsx`; UI composed of modular sections under `src/components` and `src/sections`.
- **Backend**: Spring Boot 3 (Java 17) REST API with JWT auth, PostgreSQL via Spring Data JPA, and OpenAPI/Swagger (`springdoc-openapi-starter-webmvc-ui`).
- **Data layer**: PostgreSQL 16 with JPA entities for `User`, `Transaction`, and `InstallmentPlan`. Installment plans cascade-generate transactions.
- **Security**: JWT-based stateless auth (`AuthController` for login/register). Endpoints under `/api/**` require authentication except `/api/auth/**` and `/health`.
- **Deployment**: Dockerized services orchestrated via `docker-compose.*.yml`, with Nginx acting as reverse proxy/static server.

## High-level flow
1. User authenticates through the frontend; credentials are sent to `/api/auth/login` or `/api/auth/register`.
2. Backend issues JWT; frontend stores it (context) and attaches it to Axios requests.
3. Authenticated requests hit `/api/**` endpoints, which map to services and repositories.
4. Transactions and installment plans are persisted in PostgreSQL; summaries and search queries are served back to the UI.

## Project layout
```
frontend/   # React app, Chakra UI, Recharts, Framer Motion
backend/    # Spring Boot API, JPA, Security, DTOs, mappers
data/       # Sample data / fixtures (if provided)
docker-*    # Docker/Compose scripts for dev/prod
```

## Notable modules
- Backend controllers: `AuthController`, `TransactionController`, `InstallmentPlanController`, `HealthController`.
- Backend services: auth, transactions (CRUD, search, summaries), installment plans (plan creation + transaction generation).
- Frontend pages: `Dashboard`, `AllTransactionsPage`, `ChartsPage`, `LandingPage`.
- Frontend components: transaction form/modal, search modal, charts modal, summary cards, installment plans, layout header/nav.

## Observability and tooling
- Health check: `GET /health`.
- API docs: served via Springdoc/OpenAPI UI (if enabled at runtime).
- Logging: Spring Boot defaults with tuned log levels in `application.properties`.

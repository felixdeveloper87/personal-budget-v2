# Personal Budget v2

A full-stack personal finance manager with real-time insights, installment tracking, and a responsive UI. Built with React + TypeScript on the frontend and Spring Boot + PostgreSQL on the backend, fully containerized for easy deployment.

- Live demo: https://personalbudget.co.uk

## Highlights
- Dashboard with income/expense/balance summaries and period navigation
- Transaction CRUD with search, filters, and quick number pad input
- Category analytics with charts and drill-down modals
- Installment plans that auto-generate monthly transactions
- JWT authentication with role-aware security
- Dark/light theme, responsive layout, and polished UX

## Tech stack
- Frontend: React 18, TypeScript, Chakra UI, Recharts, Framer Motion, Axios, Vite
- Backend: Spring Boot 3 (Java 17), Spring Data JPA, Spring Security + JWT, PostgreSQL, Springdoc OpenAPI
- DevOps: Docker, Docker Compose, Nginx

## Quick start (Docker)
```bash
git clone https://github.com/yourusername/personal-budget-v2.git
cd personal-budget-v2
cp env.example .env   # set DB/JWT secrets as needed

# Development stack
docker-compose -f docker-compose.dev.yml up -d
# Frontend: http://localhost:3000 | Backend: http://localhost:8080
```

## Local development (without Docker)
- Backend: `cd backend && mvn spring-boot:run` (requires Java 17 + PostgreSQL with matching env vars)
- Frontend: `cd frontend && npm install && npm run dev` (uses Vite dev server at http://localhost:3000)
- Environment: set `DB_*`, `JWT_*`, and `VITE_API_URL` (see `env.example` and `application.properties`)

## Documentation
- Architecture: `docs/ARCHITECTURE.md`
- Backend guide: `docs/BACKEND.md`
- Frontend guide: `docs/FRONTEND.md`
- API reference: `docs/API.md`
- Deployment: `docs/DEPLOYMENT.md`
- Docker-specific notes: `DOCKER_README.md`, `README_DEPLOY.md`, `VERCEL_CONFIG.md`, `VPS_SETUP.md`
- Additional feature docs: `backend/INSTALLMENT_PLANS_README.md`, `backend/PERFORMANCE_ANALYSIS.md`, `backend/PROFILES_README.md`, `backend/POSTGRESQL_SETUP.md`

## Project structure
```
frontend/   # React + TypeScript app (UI, pages, hooks, contexts, theme)
backend/    # Spring Boot API (controllers, services, repositories, security)
data/       # Sample data/fixtures (optional)
docker-*    # Compose files and helper scripts for dev/prod
```

## Deployment
- Compose production: `docker-compose -f docker-compose.prod.yml up -d`
- Nginx serves the built frontend and proxies `/api` to the backend container; configure TLS in `nginx-production*.conf`.
- Detailed steps: `docs/DEPLOYMENT.md`

## License
MIT — see `LICENSE`.

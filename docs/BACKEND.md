# Backend Guide (Spring Boot)

## Stack
- Spring Boot 3.3, Java 17, Maven
- Spring Data JPA (PostgreSQL)
- Spring Security + JWT (jjwt)
- Springdoc OpenAPI UI

## Modules
- `controller`: REST endpoints (`AuthController`, `TransactionController`, `InstallmentPlanController`, `HealthController`)
- `service`: business logic, authorization checks, summaries, installment generation
- `repository`: JPA repositories
- `dto`/`mapper`: request/response objects and mappers
- `security`: JWT filters/configuration

## Configuration
Key properties live in `backend/src/main/resources/application.properties`:
- `spring.datasource.url=jdbc:postgresql://${DB_HOST:db}:${DB_PORT:5432}/${DB_NAME:personalbudget}`
- `spring.datasource.username=${DB_USER:postgres}`
- `spring.datasource.password=${DB_PASSWORD:postgres}`
- `jwt.secret`, `jwt.expiration`
- `server.port=8080`

Environment variables (align with `.env`):
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` (default `db` when using Compose), `DB_PORT`
- `JWT_SECRET`, `JWT_EXPIRATION`

## Running locally
### With Docker (recommended)
```bash
docker-compose -f docker-compose.dev.yml up -d
# API available at http://localhost:8080
```

### Without Docker
Prereqs: Java 17, Maven, PostgreSQL running with matching env vars.
```bash
cd backend
mvn spring-boot:run
# or: mvn clean package && java -jar target/personalbudget-backend-0.0.1-SNAPSHOT.jar
```

## Key endpoints
See `docs/API.md` for detailed request/response shapes.
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — authenticate, returns JWT
- `GET /api/transactions` — list user transactions
- `POST /api/transactions` — create transaction
- `PUT /api/transactions/{id}` — update transaction
- `DELETE /api/transactions/{id}` — delete transaction
- `GET /api/transactions/search` — search with text/type/category/date filters
- `GET /api/summary/month` — monthly aggregates
- `POST /api/installment-plans` — create plan + auto-generated installments
- `GET /api/installment-plans` — list plans
- `GET /api/installment-plans/{id}` — plan detail
- `DELETE /api/installment-plans/{id}` — remove plan (+ cascade delete)
- `GET /health` — liveness probe

## Data model highlights
- **User**: credentials + ownership for all data.
- **Transaction**: `type` (income/expense), `category`, `amount`, `dateTime`, optional link to an `InstallmentPlan`.
- **InstallmentPlan**: number of installments, value per installment, start date; creates linked transactions via cascade.

## Development tips
- Use the included `init-database.sql` or migrations when provisioning databases.
- OpenAPI UI is available if `springdoc` endpoint is exposed (typ. `/swagger-ui.html`).
- Logging levels can be tuned via `logging.level.*` entries in `application.properties`.

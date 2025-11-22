# REST API

Base URL: `http://localhost:8080` (dev) or your deployed backend URL. All endpoints except `/api/auth/**` and `/health` require a valid `Authorization: Bearer <token>` header.

## Authentication
- `POST /api/auth/register`
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Response: `{ user: { id, name, email }, token }`
- `POST /api/auth/login`
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `{ user: { id, name, email }, token }`

## Transactions
- `GET /api/transactions` — list authenticated user's transactions.
- `POST /api/transactions`
  - Body: `{ description, type: "income"|"expense", category, amount, dateTime, installmentPlanId? }`
  - Response: created transaction.
- `PUT /api/transactions/{id}` — update fields of an existing transaction (must own it).
- `DELETE /api/transactions/{id}` — delete a transaction (must own it).
- `GET /api/transactions/search`
  - Query params (all optional): `text`, `type` (`income|expense`), `category`, `startDate` (`yyyy-MM-dd`), `endDate` (`yyyy-MM-dd`).
  - Response: array of `{ id, description, type, category, amount, date, installmentPlanId? }`.

## Analytics
- `GET /api/summary/month`
  - Query params: `year` (e.g., `2024`), `month` (`1-12`).
  - Response: `MonthlySummary` with totals (income, expenses, balance) and category breakdowns.

## Installment plans
- `POST /api/installment-plans`
  - Body: `{ description, category, valuePerInstallment, installments, startDate, type }`
  - Behavior: creates the plan and auto-generates linked monthly transactions.
- `GET /api/installment-plans` — list plans (newest first).
- `GET /api/installment-plans/{id}` — fetch a plan with its transactions.
- `DELETE /api/installment-plans/{id}` — delete a plan and cascade delete its transactions.

## Health
- `GET /health` — returns `OK`.

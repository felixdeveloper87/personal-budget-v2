# REST API

Base URL: `http://localhost:8080` (dev) or your deployed backend URL. All endpoints except `/api/auth/**` and `/health` require a valid `Authorization: Bearer <token>` header.

## Authentication
- `POST /api/auth/register`
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Response: `{ user: { id, name, email }, token }`
- `POST /api/auth/login`
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `{ user: { id, name, email }, token }`
- `POST /api/auth/reset-password`
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `204 No Content`

## Transactions
- `GET /api/transactions` — list authenticated user's transactions.
  - Optional `from` + `to` (`yyyy-MM-dd`, both required together): only transactions whose purchase date **or** payment date falls in the window. The web app always sends them; without them the whole history is returned.
- `GET /api/transactions/page` — one page, newest purchase first.
  - Query params: `page` (default `0`), `size` (default `50`, max `200`), plus the same optional filters as `/search`.
  - Response: `{ items, page, size, totalElements, hasNext }`.
- `POST /api/transactions`
  - Body: `{ description, type: "income"|"expense", category, amount, dateTime, installmentPlanId? }`
  - Response: created transaction.
- `PUT /api/transactions/{id}` — update fields of an existing transaction (must own it).
- `DELETE /api/transactions/{id}` — delete a transaction (must own it).
- `GET /api/transactions/search`
  - Query params (all optional): `text`, `type` (`income|expense`), `category`, `startDate` (`yyyy-MM-dd`), `endDate` (`yyyy-MM-dd`).
  - Response includes `merchantName` and `merchantDomain` when the description matches the server merchant catalog.

## Credit card statements
Statements (faturas) are computed on the server by `CreditCardStatementCalculator`, using the same closing/payment rules as `CreditCardBillingService`.
- `GET /api/payment-methods/cards/overview` — per credit card: `{ cardId, currentTotal, outstanding, nextPaymentDate, nextPaymentAmount, statementCount }`. `outstanding` sums every statement not yet due. No transactions in the payload.
- `GET /api/payment-methods/{id}/statements` — every statement of one card, newest first: `{ key ("YYYY-MM"), periodStart, closingDate, paymentDate, status ("open"|"closed"|"upcoming"), total, transactionCount, transactions[] }`. `404` if the card is not the user's credit card.

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

# Accounts migration and deployment

Migrations `V6__accounts_goals_budgets_and_cash_flow.sql` and
`V7__financial_account_overdraft.sql` are additive. They do not delete, rename,
or rewrite existing financial rows.

## Existing data behavior

- Existing transactions receive `status = CLEARED`.
- Existing transactions keep `account_id = NULL`.
- Existing installment plans and recurring rules keep `account_id = NULL`.
- Users can continue viewing all existing transactions, reports and categories.
- A user explicitly associates legacy rows from the Accounts page.

An account stores a known balance and a precise `balance_anchor_at` timestamp.
Transactions dated before that anchor can be associated for history and reporting
without changing the known current balance.

## Before production deployment

1. Stop application writes or briefly put the site in maintenance mode.
2. Create a PostgreSQL backup:

   ```bash
   pg_dump -Fc -h <host> -U <user> <database> > personalbudget-before-v6.dump
   ```

3. Verify the backup is non-empty and keep it outside the application container.
4. Build the backend image. The Dockerfile runs `mvn clean verify`.
5. Deploy the backend. Flyway applies V6 before Hibernate validates the schema.

## Post-deployment checks

Run these read-only checks:

```sql
SELECT COUNT(*) FROM transactions;
SELECT COUNT(*) FROM transactions WHERE account_id IS NULL;
SELECT status, COUNT(*) FROM transactions GROUP BY status;
SELECT version, description, success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 3;
```

The transaction count must match the pre-deployment count, all legacy rows should
initially be unassigned, and Flyway V6 must be successful.

## User migration flow

1. Create each current, savings, cash or credit account using its known current balance.
   A negative balance is valid. Current accounts can also define an overdraft limit.
2. Associate old transactions by payment method and optional date range.
3. Open Installments and Fixed payments, edit each rule, and select its account.
   Updating a rule propagates the account to its linked transactions.
4. Review the unassigned transaction count until it reaches zero.

Do not bulk-assign all history to one account unless that is factually correct.

## Rollback

Application rollback should normally restore the previous application image while
leaving V6 tables and nullable columns in place; older code ignores them. If a full
database rollback is required, restore the pre-V6 dump into a separate database and
switch the application only after validating counts.

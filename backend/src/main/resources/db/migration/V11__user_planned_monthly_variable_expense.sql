-- Optional global "estimated day-to-day expense" used by the cash-flow forecast
-- as a monthly assumption for variable spending (groceries, transport, etc) —
-- deliberately separate from fixed payments and installments, which are already
-- scheduled from real recurring/installment records. NULL means "no plan; the
-- forecast only counts fixed expenses and installments for future months".

ALTER TABLE users ADD COLUMN IF NOT EXISTS planned_monthly_variable_expense NUMERIC(14, 2);
ALTER TABLE users ADD CONSTRAINT chk_users_planned_monthly_variable_expense
    CHECK (planned_monthly_variable_expense IS NULL OR planned_monthly_variable_expense >= 0);

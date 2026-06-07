-- Optional global "expected monthly income" used by the cash-flow forecast as a
-- predictable (but not fixed) income tier. NULL means "no plan; estimate from history".

ALTER TABLE users ADD COLUMN IF NOT EXISTS planned_monthly_income NUMERIC(14, 2);
ALTER TABLE users ADD CONSTRAINT chk_users_planned_monthly_income
    CHECK (planned_monthly_income IS NULL OR planned_monthly_income >= 0);

-- Additive financial planning model.
-- Existing transactions remain untouched and unassigned until the user links them.

CREATE TABLE financial_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(30) NOT NULL,
    institution VARCHAR(120),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    opening_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
    balance_anchor_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_financial_accounts_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_financial_accounts_type
        CHECK (type IN ('CURRENT', 'SAVINGS', 'CASH', 'CREDIT_CARD'))
);

CREATE INDEX idx_financial_accounts_user_active
    ON financial_accounts (user_id, active);

CREATE TABLE account_transfers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    from_account_id BIGINT NOT NULL,
    to_account_id BIGINT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    transfer_date DATE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_account_transfers_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_account_transfers_from
        FOREIGN KEY (from_account_id) REFERENCES financial_accounts (id),
    CONSTRAINT fk_account_transfers_to
        FOREIGN KEY (to_account_id) REFERENCES financial_accounts (id),
    CONSTRAINT chk_account_transfer_accounts CHECK (from_account_id <> to_account_id),
    CONSTRAINT chk_account_transfer_amount CHECK (amount > 0)
);

CREATE INDEX idx_account_transfers_user_date
    ON account_transfers (user_id, transfer_date);
CREATE INDEX idx_account_transfers_from_date
    ON account_transfers (from_account_id, transfer_date);
CREATE INDEX idx_account_transfers_to_date
    ON account_transfers (to_account_id, transfer_date);

ALTER TABLE transactions
    ADD COLUMN account_id BIGINT,
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'CLEARED',
    ADD CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id) REFERENCES financial_accounts (id) ON DELETE SET NULL,
    ADD CONSTRAINT chk_transactions_status
        CHECK (status IN ('PLANNED', 'PENDING', 'CLEARED', 'RECONCILED'));

CREATE INDEX idx_transactions_account_payment_date
    ON transactions (account_id, payment_date);
CREATE INDEX idx_transactions_user_account_status
    ON transactions (user_id, account_id, status);

ALTER TABLE installment_plan
    ADD COLUMN account_id BIGINT,
    ADD COLUMN payment_method_id BIGINT,
    ADD CONSTRAINT fk_installment_plan_account
        FOREIGN KEY (account_id) REFERENCES financial_accounts (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_installment_plan_payment_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id) ON DELETE SET NULL;

ALTER TABLE recurring_transactions
    ADD COLUMN account_id BIGINT,
    ADD COLUMN payment_method_id BIGINT,
    ADD CONSTRAINT fk_recurring_transactions_account
        FOREIGN KEY (account_id) REFERENCES financial_accounts (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_recurring_transactions_payment_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id) ON DELETE SET NULL;

CREATE TABLE savings_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL,
    current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    target_date DATE,
    color VARCHAR(20) NOT NULL DEFAULT '#2563eb',
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_savings_goals_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_savings_goal_target CHECK (target_amount > 0),
    CONSTRAINT chk_savings_goal_current CHECK (current_amount >= 0)
);

CREATE INDEX idx_savings_goals_user_archived
    ON savings_goals (user_id, archived);

CREATE TABLE savings_goal_contributions (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_savings_goal_contributions_goal
        FOREIGN KEY (goal_id) REFERENCES savings_goals (id) ON DELETE CASCADE,
    CONSTRAINT chk_savings_goal_contribution_amount CHECK (amount <> 0)
);

CREATE INDEX idx_savings_goal_contributions_goal_date
    ON savings_goal_contributions (goal_id, contribution_date);

CREATE TABLE category_budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(120) NOT NULL,
    budget_year INTEGER NOT NULL,
    budget_month INTEGER NOT NULL,
    limit_amount NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_budgets_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_category_budget_month
        UNIQUE (user_id, category, budget_year, budget_month),
    CONSTRAINT chk_category_budget_month CHECK (budget_month BETWEEN 1 AND 12),
    CONSTRAINT chk_category_budget_limit CHECK (limit_amount > 0)
);

CREATE INDEX idx_category_budgets_user_period
    ON category_budgets (user_id, budget_year, budget_month);

COMMENT ON COLUMN financial_accounts.opening_balance IS
    'Known account balance at balance_anchor_at. Older linked history does not change the current balance.';
COMMENT ON COLUMN transactions.account_id IS
    'Nullable for legacy rows until the user explicitly associates them with an account.';

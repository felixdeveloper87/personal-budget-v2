ALTER TABLE financial_accounts
    ADD COLUMN overdraft_limit NUMERIC(14, 2) NOT NULL DEFAULT 0,
    ADD CONSTRAINT chk_financial_accounts_overdraft_limit
        CHECK (overdraft_limit >= 0);

COMMENT ON COLUMN financial_accounts.overdraft_limit IS
    'Optional overdraft facility for current accounts. Zero means no configured facility.';

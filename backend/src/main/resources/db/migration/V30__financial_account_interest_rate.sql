ALTER TABLE financial_accounts
    ADD COLUMN interest_rate NUMERIC(6, 3),
    ADD CONSTRAINT chk_financial_accounts_interest_rate
        CHECK (interest_rate IS NULL OR (interest_rate >= 0 AND interest_rate <= 100));

COMMENT ON COLUMN financial_accounts.interest_rate IS
    'Optional annual interest rate (AER, in percent) for savings accounts. NULL means not configured.';

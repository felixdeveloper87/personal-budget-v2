-- Credit cards gain an optional credit limit and a settlement account.
-- The settlement account is the balance account the card statement is debited
-- from (e.g. a NatWest card is paid from the NatWest current account), so an
-- installment plan linked to the card can default to that account.

ALTER TABLE payment_methods
    ADD COLUMN credit_limit NUMERIC(14, 2),
    ADD COLUMN settlement_account_id BIGINT;

ALTER TABLE payment_methods
    ADD CONSTRAINT fk_payment_methods_settlement_account
        FOREIGN KEY (settlement_account_id) REFERENCES financial_accounts (id) ON DELETE SET NULL,
    ADD CONSTRAINT chk_payment_methods_credit_limit
        CHECK (credit_limit IS NULL OR credit_limit >= 0);

CREATE INDEX idx_payment_methods_settlement_account ON payment_methods (settlement_account_id);

COMMENT ON COLUMN payment_methods.credit_limit IS 'Optional credit limit, only meaningful for credit cards';
COMMENT ON COLUMN payment_methods.settlement_account_id IS 'Balance account the card statement is debited from';

CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(30) NOT NULL,
    issuer VARCHAR(120),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    statement_closing_day INTEGER,
    payment_day INTEGER,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_methods_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_methods_type CHECK (type IN ('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER')),
    CONSTRAINT chk_payment_methods_credit_card_days CHECK (
        (
            type = 'CREDIT_CARD'
            AND statement_closing_day BETWEEN 1 AND 31
            AND payment_day BETWEEN 1 AND 31
        )
        OR
        (
            type <> 'CREDIT_CARD'
            AND statement_closing_day IS NULL
            AND payment_day IS NULL
        )
    )
);

ALTER TABLE transactions
    ADD COLUMN transaction_date DATE,
    ADD COLUMN payment_date DATE,
    ADD COLUMN payment_method_id BIGINT;

UPDATE transactions
SET transaction_date = COALESCE(date_time::date, CURRENT_DATE),
    payment_date = COALESCE(date_time::date, CURRENT_DATE)
WHERE transaction_date IS NULL OR payment_date IS NULL;

ALTER TABLE transactions
    ALTER COLUMN transaction_date SET NOT NULL,
    ALTER COLUMN payment_date SET NOT NULL,
    ADD CONSTRAINT fk_transactions_payment_method FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id) ON DELETE SET NULL;

CREATE INDEX idx_payment_methods_user_active ON payment_methods (user_id, active);
CREATE INDEX idx_payment_methods_user_type ON payment_methods (user_id, type);
CREATE INDEX idx_transactions_user_payment_date ON transactions (user_id, payment_date);
CREATE INDEX idx_transactions_payment_method_id ON transactions (payment_method_id);

COMMENT ON TABLE payment_methods IS 'User-owned payment instruments such as cash, debit cards, credit cards, and bank transfer accounts';
COMMENT ON COLUMN transactions.transaction_date IS 'Calendar date when the transaction actually happened';
COMMENT ON COLUMN transactions.payment_date IS 'Financial competence date when the transaction impacts budget and summaries';

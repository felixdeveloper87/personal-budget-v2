-- Baseline schema (matches JPA entities + legacy hand migrations).
-- Existing databases: Flyway baselines at V1 and skips this script.
-- Empty databases: Flyway runs this before Hibernate validate.

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6),
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE installment_plan (
    id BIGSERIAL PRIMARY KEY,
    total_installments INTEGER NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    installment_value NUMERIC(15, 2) NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_installment_plan_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    frequency VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_run_date DATE NOT NULL,
    day_of_month INTEGER NOT NULL,
    active BOOLEAN NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_recurring_transaction_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    date_time TIMESTAMP(6),
    type VARCHAR(255),
    category VARCHAR(255),
    description VARCHAR(255),
    amount NUMERIC(14, 2),
    user_id BIGINT NOT NULL,
    installment_plan_id BIGINT,
    installment_number INTEGER,
    recurring_transaction_id BIGINT,
    CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_transaction_installment_plan FOREIGN KEY (installment_plan_id) REFERENCES installment_plan (id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_recurring_transaction FOREIGN KEY (recurring_transaction_id) REFERENCES recurring_transactions (id)
);

CREATE INDEX idx_transactions_installment_plan_id ON transactions (installment_plan_id);
CREATE INDEX idx_installment_plan_user_id ON installment_plan (user_id);
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions (user_id);
CREATE INDEX idx_recurring_transactions_active_next_run_date ON recurring_transactions (active, next_run_date);
CREATE INDEX idx_transactions_recurring_transaction_id ON transactions (recurring_transaction_id);

COMMENT ON TABLE installment_plan IS 'Tabela que armazena planos de parcelamento de despesas';
COMMENT ON COLUMN installment_plan.total_installments IS 'Quantidade total de parcelas do plano';
COMMENT ON COLUMN installment_plan.total_amount IS 'Valor total do plano de parcelamento';
COMMENT ON COLUMN installment_plan.installment_value IS 'Valor de cada parcela';
COMMENT ON COLUMN transactions.installment_plan_id IS 'Referência ao plano de parcelamento (se aplicável)';
COMMENT ON COLUMN transactions.installment_number IS 'Número da parcela (1, 2, 3, ...)';
COMMENT ON TABLE recurring_transactions IS 'Tabela que armazena regras de transacoes recorrentes';
COMMENT ON COLUMN recurring_transactions.next_run_date IS 'Proxima data em que a regra deve gerar uma transacao';
COMMENT ON COLUMN recurring_transactions.day_of_month IS 'Dia alvo do mes para recorrencias mensais';
COMMENT ON COLUMN transactions.recurring_transaction_id IS 'Referencia a recorrencia que gerou a transacao, se aplicavel';

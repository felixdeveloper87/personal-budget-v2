-- Migration Script: Adicionar suporte a transacoes recorrentes
-- Execute este script no banco de dados existente

-- 1. Criar tabela recurring_transactions
CREATE TABLE IF NOT EXISTS recurring_transactions (
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
    CONSTRAINT fk_recurring_transaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Adicionar coluna na tabela transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='transactions' AND column_name='recurring_transaction_id') THEN
        ALTER TABLE transactions ADD COLUMN recurring_transaction_id BIGINT;
    END IF;
END $$;

-- 3. Adicionar foreign key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name='fk_transaction_recurring_transaction') THEN
        ALTER TABLE transactions
        ADD CONSTRAINT fk_transaction_recurring_transaction
        FOREIGN KEY (recurring_transaction_id) REFERENCES recurring_transactions(id);
    END IF;
END $$;

-- 4. Criar indices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active_next_run_date
    ON recurring_transactions(active, next_run_date);
CREATE INDEX IF NOT EXISTS idx_transactions_recurring_transaction_id
    ON transactions(recurring_transaction_id);

COMMENT ON TABLE recurring_transactions IS 'Tabela que armazena regras de transacoes recorrentes';
COMMENT ON COLUMN recurring_transactions.next_run_date IS 'Proxima data em que a regra deve gerar uma transacao';
COMMENT ON COLUMN recurring_transactions.day_of_month IS 'Dia alvo do mes para recorrencias mensais';
COMMENT ON COLUMN transactions.recurring_transaction_id IS 'Referencia a recorrencia que gerou a transacao, se aplicavel';

-- Migration Script: Adicionar suporte a planos de parcelamento
-- Execute este script no banco de dados existente

-- 1. Criar tabela installment_plan
CREATE TABLE IF NOT EXISTS installment_plan (
    id BIGSERIAL PRIMARY KEY,
    total_installments INTEGER NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    installment_value NUMERIC(15, 2) NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_installment_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Adicionar colunas na tabela transactions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='transactions' AND column_name='installment_plan_id') THEN
        ALTER TABLE transactions ADD COLUMN installment_plan_id BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='transactions' AND column_name='installment_number') THEN
        ALTER TABLE transactions ADD COLUMN installment_number INTEGER;
    END IF;
END $$;

-- 3. Adicionar foreign key
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_transaction_installment_plan') THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT fk_transaction_installment_plan 
        FOREIGN KEY (installment_plan_id) REFERENCES installment_plan(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_transactions_installment_plan_id ON transactions(installment_plan_id);
CREATE INDEX IF NOT EXISTS idx_installment_plan_user_id ON installment_plan(user_id);

-- Comentários para documentação
COMMENT ON TABLE installment_plan IS 'Tabela que armazena planos de parcelamento de despesas';
COMMENT ON COLUMN installment_plan.total_installments IS 'Quantidade total de parcelas do plano';
COMMENT ON COLUMN installment_plan.total_amount IS 'Valor total do plano de parcelamento';
COMMENT ON COLUMN installment_plan.installment_value IS 'Valor de cada parcela';
COMMENT ON COLUMN transactions.installment_plan_id IS 'Referência ao plano de parcelamento (se aplicável)';
COMMENT ON COLUMN transactions.installment_number IS 'Número da parcela (1, 2, 3, ...)';


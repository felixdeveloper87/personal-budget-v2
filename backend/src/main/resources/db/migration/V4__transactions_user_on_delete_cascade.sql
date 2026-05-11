-- Allow deleting a user from the DB while their transactions are removed automatically.
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS fk_transaction_user;
ALTER TABLE transactions
    ADD CONSTRAINT fk_transaction_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

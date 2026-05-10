-- Speeds up list/search/summary queries that filter by owner and date range.
-- PostgreSQL does not auto-index FK columns on the child table.
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date_time ON transactions (user_id, date_time);

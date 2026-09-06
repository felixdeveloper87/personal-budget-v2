-- Household payments are now completed by the payer in one step. Existing
-- payments that were waiting for the recipient are treated as already made.
UPDATE household_settlements
SET status = 'CONFIRMED',
    confirmed_by_user_id = COALESCE(confirmed_by_user_id, created_by_user_id),
    confirmed_at = COALESCE(confirmed_at, created_at, CURRENT_TIMESTAMP)
WHERE status = 'PENDING';

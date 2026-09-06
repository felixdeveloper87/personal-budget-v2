-- Separate recipient address for operational/product communications.
-- The existing users.email remains the unique login address.
ALTER TABLE users ADD COLUMN IF NOT EXISTS communication_email VARCHAR(255);

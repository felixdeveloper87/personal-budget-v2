-- Installments removed when a plan is ended early. Kept so the schedule can
-- still show the ones that were never paid (total_installments shrinks to the
-- paid count on close).
ALTER TABLE installment_plan ADD COLUMN cancelled_installments INTEGER NOT NULL DEFAULT 0;

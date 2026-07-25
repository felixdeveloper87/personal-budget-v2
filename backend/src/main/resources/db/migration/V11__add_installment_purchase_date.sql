-- Preserve the original purchase date separately from the monthly payment schedule.
ALTER TABLE installment_plan
    ADD COLUMN purchase_date DATE;

-- Historical plans did not retain the original purchase date. The first
-- installment is the best available approximation and leaves payment dates intact.
UPDATE installment_plan plan
SET purchase_date = first_installment.first_date
FROM (
    SELECT installment_plan_id, MIN(transaction_date) AS first_date
    FROM transactions
    WHERE installment_plan_id IS NOT NULL
    GROUP BY installment_plan_id
) first_installment
WHERE plan.id = first_installment.installment_plan_id
  AND plan.purchase_date IS NULL;

-- Activity/behaviour reports use transaction_date. Each installment belongs to
-- the original purchase; cash-flow continues to use the untouched payment_date.
UPDATE transactions t
SET transaction_date = plan.purchase_date
FROM installment_plan plan
WHERE t.installment_plan_id = plan.id
  AND plan.purchase_date IS NOT NULL
  AND t.transaction_date IS DISTINCT FROM plan.purchase_date;

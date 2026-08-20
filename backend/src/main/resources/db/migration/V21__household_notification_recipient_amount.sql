ALTER TABLE household_notifications
    ADD COLUMN recipient_amount NUMERIC(14, 2);

ALTER TABLE household_notifications
    ADD CONSTRAINT chk_household_notifications_recipient_amount_nonnegative
        CHECK (recipient_amount IS NULL OR recipient_amount >= 0);

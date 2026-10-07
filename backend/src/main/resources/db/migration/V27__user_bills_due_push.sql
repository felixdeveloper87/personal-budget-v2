-- Personal push: "due tomorrow" reminder for scheduled expenses. On by default;
-- it only reaches users who turned push notifications on for a device.
ALTER TABLE users
    ADD COLUMN push_bills_due BOOLEAN NOT NULL DEFAULT TRUE;

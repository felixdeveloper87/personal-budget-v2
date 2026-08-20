CREATE TABLE household_notifications (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL,
    recipient_member_id BIGINT NOT NULL,
    actor_member_id BIGINT,
    type VARCHAR(48) NOT NULL,
    reference_id BIGINT,
    subject VARCHAR(255),
    amount NUMERIC(14, 2),
    dedupe_key VARCHAR(160),
    created_at TIMESTAMP(6) NOT NULL,
    read_at TIMESTAMP(6),
    CONSTRAINT fk_household_notifications_household
        FOREIGN KEY (household_id) REFERENCES households (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_notifications_recipient
        FOREIGN KEY (recipient_member_id) REFERENCES household_members (id),
    CONSTRAINT fk_household_notifications_actor
        FOREIGN KEY (actor_member_id) REFERENCES household_members (id),
    CONSTRAINT chk_household_notifications_amount_positive
        CHECK (amount IS NULL OR amount > 0)
);

CREATE INDEX idx_household_notifications_recipient_created
    ON household_notifications (recipient_member_id, created_at DESC, id DESC);

CREATE INDEX idx_household_notifications_recipient_unread
    ON household_notifications (recipient_member_id, created_at DESC)
    WHERE read_at IS NULL;

CREATE UNIQUE INDEX uq_household_notifications_recipient_dedupe
    ON household_notifications (recipient_member_id, dedupe_key)
    WHERE dedupe_key IS NOT NULL;

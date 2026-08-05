-- Private Household proof images. This migration is additive and preserves all
-- existing Household and Personal Budget records.

CREATE TABLE household_attachments (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL,
    expense_id BIGINT,
    settlement_id BIGINT,
    uploaded_by_user_id BIGINT,
    storage_key VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    size_bytes BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP(6) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    deleted_at TIMESTAMP(6),
    CONSTRAINT fk_household_attachments_household
        FOREIGN KEY (household_id) REFERENCES households (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_attachments_expense
        FOREIGN KEY (expense_id) REFERENCES household_expenses (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_attachments_settlement
        FOREIGN KEY (settlement_id) REFERENCES household_settlements (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_attachments_uploaded_by
        FOREIGN KEY (uploaded_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_household_attachments_storage_key UNIQUE (storage_key),
    CONSTRAINT chk_household_attachments_one_parent CHECK (
        (expense_id IS NOT NULL AND settlement_id IS NULL)
        OR (expense_id IS NULL AND settlement_id IS NOT NULL)
    ),
    CONSTRAINT chk_household_attachments_size CHECK (size_bytes > 0)
);

CREATE INDEX idx_household_attachments_expense
    ON household_attachments (expense_id, status, created_at);
CREATE INDEX idx_household_attachments_settlement
    ON household_attachments (settlement_id, status, created_at);
CREATE INDEX idx_household_attachments_expiry
    ON household_attachments (status, expires_at)
    WHERE status = 'AVAILABLE';

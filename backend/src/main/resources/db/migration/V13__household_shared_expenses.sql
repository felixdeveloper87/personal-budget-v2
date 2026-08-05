-- Additive Household ledger. This migration only creates new objects and does
-- not update or delete any existing Personal Budget data.

CREATE TABLE households (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    created_by_user_id BIGINT,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_households_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE household_members (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at TIMESTAMP(6) NOT NULL,
    deactivated_at TIMESTAMP(6),
    CONSTRAINT fk_household_members_household
        FOREIGN KEY (household_id) REFERENCES households (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_members_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uq_household_members_household_user UNIQUE (household_id, user_id)
);

CREATE TABLE household_invitations (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    invited_by_user_id BIGINT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    responded_at TIMESTAMP(6),
    CONSTRAINT fk_household_invitations_household
        FOREIGN KEY (household_id) REFERENCES households (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_invitations_target
        FOREIGN KEY (target_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_invitations_invited_by
        FOREIGN KEY (invited_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE household_expenses (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL,
    payer_member_id BIGINT NOT NULL,
    created_by_user_id BIGINT,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(80) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    expense_date DATE NOT NULL,
    personal_transaction_id BIGINT,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    voided_at TIMESTAMP(6),
    CONSTRAINT fk_household_expenses_household
        FOREIGN KEY (household_id) REFERENCES households (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_expenses_payer
        FOREIGN KEY (payer_member_id) REFERENCES household_members (id),
    CONSTRAINT fk_household_expenses_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_household_expenses_personal_transaction
        FOREIGN KEY (personal_transaction_id) REFERENCES transactions (id) ON DELETE SET NULL,
    CONSTRAINT chk_household_expenses_amount_positive CHECK (amount > 0)
);

CREATE TABLE household_expense_shares (
    id BIGSERIAL PRIMARY KEY,
    expense_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    CONSTRAINT fk_household_expense_shares_expense
        FOREIGN KEY (expense_id) REFERENCES household_expenses (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_expense_shares_member
        FOREIGN KEY (member_id) REFERENCES household_members (id),
    CONSTRAINT uq_household_expense_shares_expense_member UNIQUE (expense_id, member_id),
    CONSTRAINT chk_household_expense_shares_amount_nonnegative CHECK (amount >= 0)
);

CREATE TABLE household_settlements (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL,
    from_member_id BIGINT NOT NULL,
    to_member_id BIGINT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    settlement_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_by_user_id BIGINT,
    confirmed_by_user_id BIGINT,
    created_at TIMESTAMP(6) NOT NULL,
    confirmed_at TIMESTAMP(6),
    cancelled_at TIMESTAMP(6),
    CONSTRAINT fk_household_settlements_household
        FOREIGN KEY (household_id) REFERENCES households (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_settlements_from_member
        FOREIGN KEY (from_member_id) REFERENCES household_members (id),
    CONSTRAINT fk_household_settlements_to_member
        FOREIGN KEY (to_member_id) REFERENCES household_members (id),
    CONSTRAINT fk_household_settlements_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_household_settlements_confirmed_by
        FOREIGN KEY (confirmed_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_household_settlements_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_household_settlements_different_members CHECK (from_member_id <> to_member_id)
);

CREATE INDEX idx_household_members_user_active
    ON household_members (user_id, active);
CREATE INDEX idx_household_members_household_active
    ON household_members (household_id, active);
CREATE INDEX idx_household_invitations_target_status
    ON household_invitations (target_user_id, status);
CREATE UNIQUE INDEX uq_household_invitations_pending
    ON household_invitations (household_id, target_user_id)
    WHERE status = 'PENDING';
CREATE INDEX idx_household_expenses_household_date
    ON household_expenses (household_id, expense_date DESC, id DESC);
CREATE INDEX idx_household_expense_shares_member
    ON household_expense_shares (member_id);
CREATE INDEX idx_household_settlements_household_status
    ON household_settlements (household_id, status, settlement_date DESC);


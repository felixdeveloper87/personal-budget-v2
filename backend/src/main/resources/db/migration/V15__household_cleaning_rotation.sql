-- Weekly Household cleaning rota. Assignments are stored independently from
-- the financial ledger so completing a cleaning week never changes balances.

CREATE TABLE household_cleaning_rotations (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_household_cleaning_rotations_household
        FOREIGN KEY (household_id) REFERENCES households (id) ON DELETE CASCADE,
    CONSTRAINT uq_household_cleaning_rotations_household UNIQUE (household_id)
);

CREATE TABLE household_cleaning_rotation_members (
    id BIGSERIAL PRIMARY KEY,
    rotation_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    rotation_position INTEGER NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_household_cleaning_rotation_members_rotation
        FOREIGN KEY (rotation_id)
        REFERENCES household_cleaning_rotations (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_cleaning_rotation_members_member
        FOREIGN KEY (member_id) REFERENCES household_members (id),
    CONSTRAINT uq_household_cleaning_rotation_members_member
        UNIQUE (rotation_id, member_id),
    CONSTRAINT uq_household_cleaning_rotation_members_position
        UNIQUE (rotation_id, rotation_position),
    CONSTRAINT chk_household_cleaning_rotation_position
        CHECK (rotation_position >= 0)
);

CREATE TABLE household_cleaning_assignments (
    id BIGSERIAL PRIMARY KEY,
    rotation_id BIGINT NOT NULL,
    week_start DATE NOT NULL,
    assigned_member_id BIGINT NOT NULL,
    completed_by_user_id BIGINT,
    completed_at TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_household_cleaning_assignments_rotation
        FOREIGN KEY (rotation_id)
        REFERENCES household_cleaning_rotations (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_cleaning_assignments_member
        FOREIGN KEY (assigned_member_id) REFERENCES household_members (id),
    CONSTRAINT fk_household_cleaning_assignments_completed_by
        FOREIGN KEY (completed_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_household_cleaning_assignments_week
        UNIQUE (rotation_id, week_start),
    CONSTRAINT chk_household_cleaning_assignments_completion
        CHECK (
            (completed_at IS NULL AND completed_by_user_id IS NULL)
            OR completed_at IS NOT NULL
        )
);

CREATE INDEX idx_household_cleaning_rotation_members_rotation
    ON household_cleaning_rotation_members (rotation_id, rotation_position);
CREATE INDEX idx_household_cleaning_assignments_rotation_week
    ON household_cleaning_assignments (rotation_id, week_start);
CREATE INDEX idx_household_cleaning_assignments_member_week
    ON household_cleaning_assignments (assigned_member_id, week_start);

-- Business time tracking: one row per working session (start / pause / end, or
-- entered by hand). work_date is the user's local calendar day, sent by the app,
-- so daily totals never depend on the server's timezone.
CREATE TABLE work_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    work_date DATE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    break_seconds INTEGER NOT NULL DEFAULT 0,
    note VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_work_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_work_sessions_break_nonnegative CHECK (break_seconds >= 0),
    CONSTRAINT chk_work_sessions_end_after_start CHECK (ended_at IS NULL OR ended_at > started_at)
);

CREATE INDEX idx_work_sessions_user_date ON work_sessions (user_id, work_date);

-- At most one running (or paused) session per user.
CREATE UNIQUE INDEX uq_work_sessions_one_open_per_user
    ON work_sessions (user_id)
    WHERE ended_at IS NULL;

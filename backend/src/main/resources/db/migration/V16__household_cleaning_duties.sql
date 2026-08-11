-- Individual checklist items for each weekly cleaning assignment. Progress is
-- stored per duty so the assigned member can complete the rota over several days.

CREATE TABLE household_cleaning_duty_completions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    duty_key VARCHAR(64) NOT NULL,
    completed_by_user_id BIGINT,
    completed_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_household_cleaning_duties_assignment
        FOREIGN KEY (assignment_id)
        REFERENCES household_cleaning_assignments (id) ON DELETE CASCADE,
    CONSTRAINT fk_household_cleaning_duties_completed_by
        FOREIGN KEY (completed_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_household_cleaning_duties_assignment_key
        UNIQUE (assignment_id, duty_key)
);

CREATE INDEX idx_household_cleaning_duties_assignment
    ON household_cleaning_duty_completions (assignment_id);

-- Preserve the meaning of weeks completed before the checklist existed.
INSERT INTO household_cleaning_duty_completions (
    assignment_id,
    duty_key,
    completed_by_user_id,
    completed_at
)
SELECT
    assignment.id,
    duty.duty_key,
    assignment.completed_by_user_id,
    assignment.completed_at
FROM household_cleaning_assignments assignment
CROSS JOIN (
    VALUES
        ('shower_room'),
        ('toilet_wc'),
        ('upstairs_hallway'),
        ('stairs'),
        ('downstairs_hallway'),
        ('living_room'),
        ('all_bins'),
        ('rubbish_out')
) AS duty(duty_key)
WHERE assignment.completed_at IS NOT NULL;

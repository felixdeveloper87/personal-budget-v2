-- Keep assignments completed before the two laundry duties were introduced
-- complete by recording both new checklist items with their original metadata.

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
        ('tea_towels'),
        ('cleaning_cloths')
) AS duty(duty_key)
WHERE assignment.completed_at IS NOT NULL
ON CONFLICT (assignment_id, duty_key) DO NOTHING;

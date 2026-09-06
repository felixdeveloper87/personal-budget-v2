CREATE TABLE household_cleaning_email_deliveries (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    delivery_type VARCHAR(32) NOT NULL,
    sent_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_household_cleaning_email_delivery_assignment
        FOREIGN KEY (assignment_id) REFERENCES household_cleaning_assignments (id) ON DELETE CASCADE,
    CONSTRAINT uq_household_cleaning_email_delivery UNIQUE (assignment_id, delivery_type)
);

CREATE INDEX idx_household_cleaning_email_delivery_assignment
    ON household_cleaning_email_deliveries (assignment_id);

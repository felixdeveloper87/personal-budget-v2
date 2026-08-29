-- Optional Household-specific member names.
-- Existing rows remain untouched and continue to fall back to users.name.
ALTER TABLE household_members
    ADD COLUMN display_name VARCHAR(120);

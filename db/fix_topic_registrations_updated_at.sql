-- Fix for: record "new" has no field "updated_at"
-- Cause: DB trigger set_updated_at() assigns NEW.updated_at but topic_registrations table lacks updated_at column.

ALTER TABLE topic_registrations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE topic_registrations
SET updated_at = COALESCE(updated_at, registration_date, CURRENT_TIMESTAMP);

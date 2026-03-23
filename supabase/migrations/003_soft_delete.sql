-- 003_soft_delete.sql
-- Adaugă câmpul deleted_at pentru soft delete pe messages și composed_emails.

ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE composed_emails ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

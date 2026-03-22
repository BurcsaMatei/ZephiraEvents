-- ============================================================
-- ZephiraEvents — Adaugă tipul email_inbound în messages
-- Migration: 002_add_email_inbound_type
-- Data: 2026-03-23
-- ============================================================

-- Extinde constraint-ul de tip pentru a accepta emailuri inbound IMAP
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_type_check
  CHECK (type IN ('contact', 'offer', 'email_inbound'));

-- ============================================================
-- ZephiraEvents — pg_cron job: sync IMAP la fiecare 10 minute
-- Migration: 004_pg_cron_sync
-- Data: 2026-03-24
-- ============================================================
-- Necesită extensiile pg_cron și pg_net activate în Supabase Dashboard
-- (Database → Extensions → pg_cron, pg_net).
--
-- Variabilele app.supabase_url și app.service_role_key trebuie setate:
--   ALTER DATABASE postgres SET app.supabase_url = 'https://<ref>.supabase.co';
--   ALTER DATABASE postgres SET app.service_role_key = '<service_role_key>';
-- (sau via Supabase Dashboard → Settings → Database → Configuration)
-- ============================================================

-- Activează extensiile necesare
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Șterge job-ul existent dacă există (pentru re-run safe)
SELECT cron.unschedule('sync-imap-every-10min')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-imap-every-10min'
);

-- Creează job-ul: POST la Edge Function sync-imap la fiecare 10 minute
SELECT cron.schedule(
  'sync-imap-every-10min',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url        := current_setting('app.supabase_url') || '/functions/v1/sync-imap',
    headers    := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body       := '{}'::jsonb
  );
  $$
);

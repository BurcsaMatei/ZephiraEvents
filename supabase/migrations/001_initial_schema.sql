-- ============================================================
-- ZephiraEvents — Schema inițial admin dashboard
-- Migration: 001_initial_schema
-- Data: 2026-03-22
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. messages — formulare contact + solicitări ofertă
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL    DEFAULT now(),
  type         text        NOT NULL    CHECK (type IN ('contact', 'offer')),
  status       text        NOT NULL    DEFAULT 'new'
                           CHECK (status IN ('new', 'read', 'replied', 'archived')),

  -- câmpuri comune
  name         text        NOT NULL,
  email        text        NOT NULL,
  phone        text,
  message      text,

  -- câmpuri specifice ofertei
  event_type   text,
  event_date   date,
  guests       integer,
  lodging      text,
  rooms        integer,
  nights       integer,
  extras       text[],

  -- metadate suplimentare (IP hash, user-agent, recaptcha score etc.)
  metadata     jsonb
);

CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS messages_type_idx       ON messages (type);
CREATE INDEX IF NOT EXISTS messages_status_idx     ON messages (status);

-- ──────────────────────────────────────────────────────────
-- 2. admin_replies — răspunsuri trimise din dashboard
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_replies (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL    DEFAULT now(),
  message_id  uuid        NOT NULL    REFERENCES messages (id) ON DELETE CASCADE,
  body        text        NOT NULL,
  sent_at     timestamptz,
  sent_by     text
);

CREATE INDEX IF NOT EXISTS admin_replies_message_id_idx ON admin_replies (message_id);

-- ──────────────────────────────────────────────────────────
-- 3. composed_emails — emailuri standalone compuse în admin
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS composed_emails (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL    DEFAULT now(),
  to_email    text        NOT NULL,
  to_name     text,
  subject     text        NOT NULL,
  body        text        NOT NULL,
  status      text        NOT NULL    DEFAULT 'draft'
              CHECK (status IN ('draft', 'sent', 'failed')),
  sent_at     timestamptz
);

CREATE INDEX IF NOT EXISTS composed_emails_status_idx ON composed_emails (status);

-- ──────────────────────────────────────────────────────────
-- 4. reviews — recenzii trimise de clienți, în așteptare aprobare
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL    DEFAULT now(),
  name         text        NOT NULL,
  rating       integer     NOT NULL    CHECK (rating BETWEEN 1 AND 5),
  text         text        NOT NULL,
  event_type   text,
  photo_base64 text,
  photo_url    text,
  status       text        NOT NULL    DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS reviews_status_idx     ON reviews (status);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews (created_at DESC);

-- ──────────────────────────────────────────────────────────
-- Row-Level Security (activat, politici adăugate în migrații ulterioare)
-- ──────────────────────────────────────────────────────────
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_replies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE composed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;

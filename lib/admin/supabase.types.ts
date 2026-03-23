// lib/admin/supabase.types.ts
// Tipuri manuale pentru schema 001_initial_schema.sql.
// Regenerare automată: npx supabase gen types typescript --project-id edgxqqkafezdcnnpsjqm

// ──────────────────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────────────────
export type MessageType = "contact" | "offer" | "email_inbound";
export type MessageStatus = "new" | "read" | "replied" | "archived";
export type EmailStatus = "draft" | "sent" | "failed";
export type ReviewStatus = "pending" | "approved" | "rejected";

// ──────────────────────────────────────────────────────────
// messages
// ──────────────────────────────────────────────────────────
export interface MessageRow {
  id: string;
  created_at: string;
  type: MessageType;
  status: MessageStatus;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  event_type: string | null;
  event_date: string | null;
  guests: number | null;
  lodging: string | null;
  rooms: number | null;
  nights: number | null;
  extras: string[] | null;
  metadata: Record<string, unknown> | null;
  deleted_at: string | null;
}

export interface MessageInsert {
  id?: string;
  created_at?: string;
  type: MessageType;
  status?: MessageStatus;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  guests?: number | null;
  lodging?: string | null;
  rooms?: number | null;
  nights?: number | null;
  extras?: string[] | null;
  metadata?: Record<string, unknown> | null;
  deleted_at?: string | null;
}

export type MessageUpdate = Partial<MessageInsert>;

// ──────────────────────────────────────────────────────────
// admin_replies
// ──────────────────────────────────────────────────────────
export interface AdminReplyRow {
  id: string;
  created_at: string;
  message_id: string;
  body: string;
  sent_at: string | null;
  sent_by: string | null;
}

export interface AdminReplyInsert {
  id?: string;
  created_at?: string;
  message_id: string;
  body: string;
  sent_at?: string | null;
  sent_by?: string | null;
}

export type AdminReplyUpdate = Partial<AdminReplyInsert>;

// ──────────────────────────────────────────────────────────
// composed_emails
// ──────────────────────────────────────────────────────────
export interface ComposedEmailRow {
  id: string;
  created_at: string;
  to_email: string;
  to_name: string | null;
  subject: string;
  body: string;
  status: EmailStatus;
  sent_at: string | null;
  deleted_at: string | null;
}

export interface ComposedEmailInsert {
  id?: string;
  created_at?: string;
  to_email: string;
  to_name?: string | null;
  subject: string;
  body: string;
  status?: EmailStatus;
  sent_at?: string | null;
  deleted_at?: string | null;
}

export type ComposedEmailUpdate = Partial<ComposedEmailInsert>;

// ──────────────────────────────────────────────────────────
// reviews
// ──────────────────────────────────────────────────────────
export interface ReviewRow {
  id: string;
  created_at: string;
  name: string;
  rating: number;
  text: string;
  event_type: string | null;
  photo_base64: string | null;
  photo_url: string | null;
  status: ReviewStatus;
  published_at: string | null;
}

export interface ReviewInsert {
  id?: string;
  created_at?: string;
  name: string;
  rating: number;
  text: string;
  event_type?: string | null;
  photo_base64?: string | null;
  photo_url?: string | null;
  status?: ReviewStatus;
  published_at?: string | null;
}

export type ReviewUpdate = Partial<ReviewInsert>;

// ──────────────────────────────────────────────────────────
// Database — tip generic pentru createClient<Database>
// ──────────────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      messages: {
        Row: MessageRow;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      admin_replies: {
        Row: AdminReplyRow;
        Insert: AdminReplyInsert;
        Update: AdminReplyUpdate;
      };
      composed_emails: {
        Row: ComposedEmailRow;
        Insert: ComposedEmailInsert;
        Update: ComposedEmailUpdate;
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

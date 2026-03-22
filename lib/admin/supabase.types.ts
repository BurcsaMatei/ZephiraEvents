// lib/admin/supabase.types.ts
// Tipuri generate manual din schema 001_initial_schema.sql.
// Regenerare automată: `npx supabase gen types typescript --project-id edgxqqkafezdcnnpsjqm`

export type MessageType = "contact" | "offer";
export type MessageStatus = "new" | "read" | "replied" | "archived";
export type EmailStatus = "draft" | "sent" | "failed";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Tables {
  messages: {
    Row: {
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
    };
    Insert: Omit<Tables["messages"]["Row"], "id" | "created_at"> &
      Partial<Pick<Tables["messages"]["Row"], "id" | "created_at">>;
    Update: Partial<Tables["messages"]["Insert"]>;
  };
  admin_replies: {
    Row: {
      id: string;
      created_at: string;
      message_id: string;
      body: string;
      sent_at: string | null;
      sent_by: string | null;
    };
    Insert: Omit<Tables["admin_replies"]["Row"], "id" | "created_at"> &
      Partial<Pick<Tables["admin_replies"]["Row"], "id" | "created_at">>;
    Update: Partial<Tables["admin_replies"]["Insert"]>;
  };
  composed_emails: {
    Row: {
      id: string;
      created_at: string;
      to_email: string;
      to_name: string | null;
      subject: string;
      body: string;
      status: EmailStatus;
      sent_at: string | null;
    };
    Insert: Omit<Tables["composed_emails"]["Row"], "id" | "created_at"> &
      Partial<Pick<Tables["composed_emails"]["Row"], "id" | "created_at">>;
    Update: Partial<Tables["composed_emails"]["Insert"]>;
  };
  reviews: {
    Row: {
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
    };
    Insert: Omit<Tables["reviews"]["Row"], "id" | "created_at"> &
      Partial<Pick<Tables["reviews"]["Row"], "id" | "created_at">>;
    Update: Partial<Tables["reviews"]["Insert"]>;
  };
}

export interface Database {
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

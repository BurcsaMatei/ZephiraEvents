// types/admin.ts
// Tipuri comune partajate între API routes și pagini admin.

export type SentKind = "new" | "reply";

export interface SentItem {
  id: string;
  kind: SentKind;
  to_email: string;
  to_name: string | null;
  subject: string;
  body: string;
  sent_at: string;
}

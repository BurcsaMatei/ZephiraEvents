// lib/admin/gmail.ts
// Gmail sync — citește emailuri UNREAD din inbox via Gmail API (OAuth2)
// și le salvează în Supabase.
// Rulat din /api/admin/imap-sync (POST, session protejată).

import type { gmail_v1 } from "googleapis";
import { google } from "googleapis";

import { supabaseAdmin } from "./supabase";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export interface GmailSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

// ──────────────────────────────────────────────────────────
// Body extraction helpers
// ──────────────────────────────────────────────────────────

function decodeBase64Url(data: string): string {
  // Gmail folosește base64url (- → +, _ → /)
  try {
    const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return "";
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Caută recursiv un part cu mimeType dat; returnează primul găsit.
function findPart(
  payload: gmail_v1.Schema$MessagePart,
  mimeType: string,
): gmail_v1.Schema$MessagePart | null {
  if (payload.mimeType === mimeType) return payload;
  for (const part of payload.parts ?? []) {
    const found = findPart(part, mimeType);
    if (found) return found;
  }
  return null;
}

function extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return "";

  // Încearcă text/plain mai întâi
  const plainPart = findPart(payload, "text/plain");
  if (plainPart?.body?.data) {
    return decodeBase64Url(plainPart.body.data).slice(0, 4000).trim();
  }

  // Fallback: text/html → strip tags
  const htmlPart = findPart(payload, "text/html");
  if (htmlPart?.body?.data) {
    return stripHtml(decodeBase64Url(htmlPart.body.data)).slice(0, 4000).trim();
  }

  // Fallback ultim: body direct pe payload (mesaj simplu, non-multipart)
  if (payload.body?.data) {
    const text = decodeBase64Url(payload.body.data);
    if (payload.mimeType === "text/html") {
      return stripHtml(text).slice(0, 4000).trim();
    }
    return text.slice(0, 4000).trim();
  }

  return "";
}

// Parsează headerul From: „Nume Prenume <email@domain.com>" sau „email@domain.com"
function parseFrom(from: string): { name: string; email: string } {
  const full = /^"?([^"<\n]+?)"?\s*<([^>\n]+)>\s*$/.exec(from);
  if (full?.[1] && full[2]) {
    return { name: full[1].trim(), email: full[2].trim() };
  }
  // Doar adresă
  return { name: from.trim(), email: from.trim() };
}

// ──────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────

export async function syncGmailMessages(): Promise<GmailSyncResult> {
  const clientId = (process.env.GMAIL_CLIENT_ID ?? "").trim();
  const clientSecret = (process.env.GMAIL_CLIENT_SECRET ?? "").trim();
  const refreshToken = (process.env.GMAIL_REFRESH_TOKEN ?? "").trim();

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Configurare Gmail incompletă (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN).",
    );
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth });

  const result: GmailSyncResult = { synced: 0, skipped: 0, errors: [] };

  // ── 1. Listează mesajele UNREAD din inbox ────────────────
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread in:inbox",
    maxResults: 50,
  });

  const messages = listRes.data.messages ?? [];
  if (messages.length === 0) return result;

  // ── 2. Procesează fiecare mesaj ──────────────────────────
  for (const msgRef of messages) {
    const gmailId = msgRef.id ?? "";
    if (!gmailId) continue;

    try {
      // Deduplicare după gmail_id stocat în metadata
      const { data: existing } = await supabaseAdmin
        .from("messages")
        .select("id")
        .filter("metadata->>gmail_id", "eq", gmailId)
        .maybeSingle();

      if (existing) {
        result.skipped++;
        // Marchează ca citit și în Gmail pentru consistență
        try {
          await gmail.users.messages.modify({
            userId: "me",
            id: gmailId,
            requestBody: { removeLabelIds: ["UNREAD"] },
          });
        } catch (modifyErr) {
          console.warn(
            `[gmail] mark-read (skip) ${gmailId}:`,
            modifyErr instanceof Error ? modifyErr.message : modifyErr,
          );
        }
        continue;
      }

      // Preia mesajul complet
      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: gmailId,
        format: "full",
      });

      const payload = msgRes.data.payload;
      const headers = payload?.headers ?? [];

      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value ?? "";

      const fromRaw = getHeader("From");
      const subject = getHeader("Subject") || "(fără subiect)";
      const dateHeader = getHeader("Date");

      if (!fromRaw) {
        result.errors.push(`${gmailId}: lipsă header From`);
        continue;
      }

      const { name, email: emailAddr } = parseFrom(fromRaw);
      const body = extractBody(payload ?? undefined);

      // ── Insert Supabase ──────────────────────────────────
      const { error: insertError } = await supabaseAdmin
        .from("messages")
        .insert({
          type: "email_inbound",
          status: "new",
          name,
          email: emailAddr,
          message: body || subject,
          metadata: {
            gmail_id: gmailId,
            subject,
            date: dateHeader,
          },
        });

      if (insertError) {
        result.errors.push(`${gmailId}: ${insertError.message}`);
        continue;
      }

      // ── Marchează ca citit în Gmail ──────────────────────
      try {
        await gmail.users.messages.modify({
          userId: "me",
          id: gmailId,
          requestBody: { removeLabelIds: ["UNREAD"] },
        });
      } catch (modifyErr) {
        console.warn(
          `[gmail] mark-read (new) ${gmailId}:`,
          modifyErr instanceof Error ? modifyErr.message : modifyErr,
        );
      }

      result.synced++;
    } catch (err) {
      result.errors.push(
        `${gmailId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return result;
}

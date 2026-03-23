// lib/admin/imap.ts
// IMAP sync — citește emailuri UNSEEN din inbox și le salvează în Supabase.
// Rulat din /api/admin/imap-sync (POST, session protejată).

import { ImapFlow } from "imapflow";

import { supabaseAdmin } from "./supabase";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export interface ImapSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

// ──────────────────────────────────────────────────────────
// MIME body extraction helpers
// ──────────────────────────────────────────────────────────

function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r\n/g, "")
    .replace(/=\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
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

function getHeaderValue(headers: string, name: string): string {
  const re = new RegExp(
    `^${name}:\\s*([^\\r\\n]+(?:\\r?\\n[ \\t][^\\r\\n]+)*)`,
    "im",
  );
  const match = headers.match(re);
  return match ? (match[1] ?? "").replace(/\r?\n[ \t]/g, " ").trim() : "";
}

function splitHeadersBody(raw: string): { headers: string; body: string } {
  const idx = raw.search(/\r?\n\r?\n/);
  if (idx === -1) return { headers: raw, body: "" };
  const isCrlf = raw.slice(idx, idx + 4) === "\r\n\r\n";
  return { headers: raw.slice(0, idx), body: raw.slice(idx + (isCrlf ? 4 : 2)) };
}

function decodeBody(body: string, encoding: string): string {
  const enc = encoding.trim().toLowerCase();
  if (enc === "base64") {
    try {
      return Buffer.from(body.replace(/\s/g, ""), "base64").toString("utf8");
    } catch {
      return body;
    }
  }
  if (enc === "quoted-printable") return decodeQuotedPrintable(body);
  return body;
}

function extractFromMultipart(body: string, boundary: string): string {
  const escaped = boundary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = body.split(new RegExp(`--${escaped}(?:--)?\\s*(?:\\r?\\n|$)`));

  // Prima trecere: text/plain
  for (const part of parts) {
    if (!part.trim()) continue;
    const { headers: ph, body: pb } = splitHeadersBody(part);
    const pct = getHeaderValue(ph, "Content-Type").toLowerCase();
    const pce = getHeaderValue(ph, "Content-Transfer-Encoding");
    if (pct.startsWith("text/plain")) {
      return decodeBody(pb, pce).slice(0, 4000).trim();
    }
  }

  // A doua trecere: text/html → strip tags
  for (const part of parts) {
    if (!part.trim()) continue;
    const { headers: ph, body: pb } = splitHeadersBody(part);
    const pct = getHeaderValue(ph, "Content-Type").toLowerCase();
    const pce = getHeaderValue(ph, "Content-Transfer-Encoding");
    if (pct.startsWith("text/html")) {
      return stripHtml(decodeBody(pb, pce)).slice(0, 4000).trim();
    }
  }

  return "";
}

function extractTextBody(sourceBuffer: Buffer): string {
  const raw = sourceBuffer.toString("utf8");
  const { headers, body } = splitHeadersBody(raw);

  const contentType = getHeaderValue(headers, "Content-Type").toLowerCase();
  const encoding = getHeaderValue(headers, "Content-Transfer-Encoding");

  if (contentType.startsWith("multipart/")) {
    const bmatch = contentType.match(/boundary="?([^";\s\r\n]+)"?/);
    if (bmatch?.[1]) return extractFromMultipart(body, bmatch[1]);
    return body.slice(0, 2000).trim();
  }

  let text = decodeBody(body, encoding);
  if (contentType.startsWith("text/html")) text = stripHtml(text);

  return text.slice(0, 4000).trim();
}

// ──────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────

export async function syncInboxMessages(): Promise<ImapSyncResult> {
  const host = (process.env.IMAP_HOST ?? "").trim();
  const port = Number(process.env.IMAP_PORT ?? 993);
  const user = (process.env.IMAP_USER ?? "").trim();
  const pass = process.env.IMAP_PASSWORD ?? "";

  if (!host || !user || !pass) {
    throw new Error(
      "Configurare IMAP incompletă (IMAP_HOST, IMAP_USER, IMAP_PASSWORD).",
    );
  }

  const result: ImapSyncResult = { synced: 0, skipped: 0, errors: [] };

  const client = new ImapFlow({
    host,
    port,
    secure: port === 993,
    auth: { user, pass },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: false as any,
    tls: { rejectUnauthorized: false },
  });

  await client.connect();

  const lock = await client.getMailboxLock("INBOX");
  try {
    const searchResult = await client.search({ seen: false }, { uid: true });
    const uids: number[] = searchResult === false ? [] : searchResult;

    if (uids.length === 0) return result;

    for await (const msg of client.fetch(
      uids,
      { envelope: true, source: true, uid: true },
      { uid: true },
    )) {
      const uid = msg.uid ?? msg.seq;
      try {
        const envelope = msg.envelope;
        if (!envelope) {
          result.errors.push(`UID ${uid}: envelope lipsă`);
          continue;
        }

        const msgId = envelope.messageId ?? `no-id-${uid}-${Date.now()}`;
        const fromAddr = envelope.from?.[0];
        const name = fromAddr?.name?.trim() || fromAddr?.address || "Necunoscut";
        const emailAddr = fromAddr?.address ?? "";
        const subject = envelope.subject ?? "(fără subiect)";

        if (!emailAddr) {
          result.errors.push(`UID ${uid}: lipsă adresă expeditor`);
          continue;
        }

        // Verifică dacă e deja sincronizat (după Message-ID din metadata)
        const { data: existing } = await supabaseAdmin
          .from("messages")
          .select("id")
          .filter("metadata->>message_id", "eq", msgId)
          .maybeSingle();

        if (existing) {
          result.skipped++;
          await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
          continue;
        }

        const body = msg.source ? extractTextBody(msg.source) : "";

        const { error: insertError } = await supabaseAdmin
          .from("messages")
          .insert({
            type: "email_inbound",
            status: "new",
            name,
            email: emailAddr,
            message: body || subject,
            metadata: {
              message_id: msgId,
              subject,
              imap_uid: uid,
            },
          });

        if (insertError) {
          result.errors.push(`UID ${uid}: ${insertError.message}`);
          continue;
        }

        await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
        result.synced++;
      } catch (err) {
        result.errors.push(
          `UID ${uid}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }

  return result;
}

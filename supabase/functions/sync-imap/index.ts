// supabase/functions/sync-imap/index.ts
// Supabase Edge Function — sync IMAP inbox → Supabase messages table.
// Rulat manual din /api/admin/imap-sync sau automat via pg_cron la 10 min.

import { createClient } from "npm:@supabase/supabase-js@2";
import { ImapFlow } from "npm:imapflow@1";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

interface MessageRow {
  id: string;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

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

function parseFrom(from: string): { name: string; email: string } {
  const full = /^"?([^"<\n]+?)"?\s*<([^>\n]+)>\s*$/.exec(from);
  if (full?.[1] && full[2]) {
    return { name: full[1].trim(), email: full[2].trim() };
  }
  return { name: from.trim(), email: from.trim() };
}

// ──────────────────────────────────────────────────────────
// Main handler
// ──────────────────────────────────────────────────────────

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const imapHost = Deno.env.get("IMAP_HOST") ?? "";
  const imapPort = parseInt(Deno.env.get("IMAP_PORT") ?? "993", 10);
  const imapUser = Deno.env.get("IMAP_USER") ?? "";
  const imapPassword = Deno.env.get("IMAP_PASSWORD") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY lipsesc." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!imapHost || !imapUser || !imapPassword) {
    return new Response(
      JSON.stringify({ error: "Credențiale IMAP incomplete (IMAP_HOST, IMAP_USER, IMAP_PASSWORD)." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const result: SyncResult = { synced: 0, skipped: 0, errors: [] };

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: true,
    auth: { user: imapUser, pass: imapPassword },
    logger: false,
    tls: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");

    try {
      // Caută mesaje UNSEEN
      const uids = await client.search({ seen: false });

      if (uids.length === 0) {
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      for await (const msg of client.fetch(uids, {
        envelope: true,
        source: true,
        uid: true,
        bodyStructure: true,
      })) {
        const messageId: string = msg.envelope?.messageId ?? "";
        const subject: string = msg.envelope?.subject ?? "(fără subiect)";
        const dateHeader: string = msg.envelope?.date?.toISOString() ?? "";

        // From: primul expeditor din envelope
        const fromAddr = msg.envelope?.from?.[0];
        const fromRaw = fromAddr
          ? `${fromAddr.name ?? ""} <${fromAddr.address ?? ""}>`.trim()
          : "";

        if (!fromRaw || !fromAddr?.address) {
          result.errors.push(`UID ${msg.uid}: lipsă expeditor`);
          continue;
        }

        const { name, email: emailAddr } = parseFrom(fromRaw);

        // Deduplicare după message_id stocat în metadata
        const dedupeKey = messageId || `uid-${msg.uid}`;
        const { data: existing } = await supabase
          .from("messages")
          .select("id")
          .filter("metadata->>message_id", "eq", dedupeKey)
          .maybeSingle<MessageRow>();

        if (existing) {
          result.skipped++;
          // Marchează ca citit indiferent
          try {
            await client.messageFlagsAdd({ uid: msg.uid }, ["\\Seen"], { uid: true });
          } catch {
            // ignorăm eroarea de marcare
          }
          continue;
        }

        // Extrage body text din source raw (plain text sau fallback html→strip)
        let body = "";
        try {
          const raw = msg.source?.toString("utf8") ?? "";
          // Caută bloc text/plain după separator header
          const plainMatch = /Content-Type:\s*text\/plain[^\r\n]*\r?\n(?:[^\r\n]+\r?\n)*\r?\n([\s\S]*?)(?=--|\r?\n--|\z)/i.exec(raw);
          if (plainMatch?.[1]) {
            body = plainMatch[1].trim().slice(0, 4000);
          } else {
            // Fallback: strip HTML din sursa brută
            body = stripHtml(raw).slice(0, 4000);
          }
        } catch {
          body = subject;
        }

        // Insert Supabase
        const { error: insertError } = await supabase.from("messages").insert({
          type: "email_inbound",
          status: "new",
          name,
          email: emailAddr,
          message: body || subject,
          metadata: {
            message_id: dedupeKey,
            subject,
            date: dateHeader,
          },
        });

        if (insertError) {
          result.errors.push(`UID ${msg.uid}: ${insertError.message}`);
          continue;
        }

        // Marchează ca citit pe server
        try {
          await client.messageFlagsAdd({ uid: msg.uid }, ["\\Seen"], { uid: true });
        } catch {
          // ignorăm eroarea de marcare — mesajul a fost salvat
        }

        result.synced++;
      }
    } finally {
      lock.release();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`IMAP connect: ${msg}`);
  } finally {
    try {
      await client.logout();
    } catch {
      // ignorăm eroarea de logout
    }
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

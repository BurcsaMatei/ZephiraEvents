// lib/kv.ts
// ==============================
// KV (Upstash via @vercel/kv) — wrapper strict
// ==============================

import { createClient } from "@vercel/kv";

const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  // eslint-disable-next-line no-console
  console.warn(
    "[lib/kv] Missing KV_REST_API_URL or KV_REST_API_TOKEN. KV calls will fail at runtime.",
  );
}

export const kv = createClient({
  url: url ?? "",
  token: token ?? "",
});

// lib/admin/supabase.ts
// Client Supabase server-side — folosit EXCLUSIV în API routes și getServerSideProps.
// Nu importa acest fișier din componente client-side sau pages/ fără guard.

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./supabase.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Supabase: lipsesc variabilele de mediu NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY.",
  );
}

/**
 * Client server-side cu service role — bypass RLS.
 * Folosit doar în API routes, getServerSideProps, getStaticProps.
 * NICIODATĂ expus în browser.
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

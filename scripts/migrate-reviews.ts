#!/usr/bin/env tsx
// scripts/migrate-reviews.ts
// One-time migration: data/reviews.json → Supabase reviews table.
// Idempotent — skip dacă recenzia există deja (name + rating + primele 50 caractere din text).
// Rulare: npm run migrate:reviews

import fs from "fs";
import path from "path";

// Încarcă .env.local înainte de orice altceva
(function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
})();

import { createClient } from "@supabase/supabase-js";

// ──────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Lipsesc NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY în .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
interface RawReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  date: string; // "YYYY-MM-DD"
  profilePhotoUrl?: string;
  photos?: string[];
}

// ──────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────
async function main() {
  const jsonPath = path.resolve(process.cwd(), "data/reviews.json");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const reviews = JSON.parse(raw) as RawReview[];

  console.log(`📄 Citite ${reviews.length} recenzii din data/reviews.json\n`);

  let inserted = 0;
  let skipped = 0;

  for (const r of reviews) {
    const textPrefix = r.text.slice(0, 50);

    // Verificare idempotentă: name + rating + primele 50 caractere din text
    const { data: existing, error: checkError } = await supabase
      .from("reviews")
      .select("id")
      .eq("name", r.authorName)
      .eq("rating", r.rating)
      .ilike("text", `${textPrefix}%`)
      .maybeSingle();

    if (checkError) {
      console.error(`  ⚠️  Eroare verificare "${r.authorName}": ${checkError.message}`);
      continue;
    }

    if (existing) {
      console.log(`  ⏭  Skip: "${r.authorName}" (există deja)`);
      skipped++;
      continue;
    }

    // Calculează timestamp-ul din câmpul date
    const publishedAt = `${r.date}T12:00:00Z`;

    const { error: insertError } = await supabase.from("reviews").insert({
      name: r.authorName,
      rating: r.rating,
      text: r.text,
      photo_url: r.profilePhotoUrl ?? null,
      status: "approved",
      published_at: publishedAt,
      created_at: publishedAt,
    });

    if (insertError) {
      console.error(`  ❌ Eroare insert "${r.authorName}": ${insertError.message}`);
      continue;
    }

    console.log(`  ✅ Inserat: "${r.authorName}" (${r.date}, ★${r.rating})`);
    inserted++;
  }

  console.log(`\n📊 Rezultat: ${inserted} inserate, ${skipped} sărite.`);
}

main().catch((err: unknown) => {
  console.error("❌ Eroare fatală:", err);
  process.exit(1);
});

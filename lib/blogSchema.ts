// lib/blogSchema.ts
// Server-only — mapare slug → date HowTo pentru JSON-LD blog (data/blog-schema.json).
// Sursă DECUPLATĂ de fluxul admin (buildMarkdownFile) — nu se pierde la editarea articolului.
// Importă EXCLUSIV din getStaticProps / getServerSideProps.

import fs from "fs";
import path from "path";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
export type HowToStep = { name: string; text: string };
export type BlogHowTo = { name: string; steps: HowToStep[] };

type BlogSchemaEntry = { howTo?: BlogHowTo };
type BlogSchemaMap = Record<string, BlogSchemaEntry>;

// ──────────────────────────────────────────────────────────
// Read
// ──────────────────────────────────────────────────────────
function schemaFile(): string {
  return path.join(process.cwd(), "data", "blog-schema.json");
}

function readSchemaMap(): BlogSchemaMap {
  try {
    const raw = fs.readFileSync(schemaFile(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "object" && parsed !== null ? (parsed as BlogSchemaMap) : {};
  } catch {
    return {};
  }
}

/** Returnează datele HowTo pentru un slug, sau null dacă nu există / sunt invalide. */
export function getBlogHowTo(slug: string): BlogHowTo | null {
  const entry = readSchemaMap()[slug];
  const howTo = entry?.howTo;
  if (!howTo || !Array.isArray(howTo.steps) || howTo.steps.length === 0) return null;
  const steps = howTo.steps.filter(
    (s): s is HowToStep => !!s && typeof s.name === "string" && typeof s.text === "string",
  );
  if (steps.length === 0) return null;
  return { name: typeof howTo.name === "string" ? howTo.name : "", steps };
}

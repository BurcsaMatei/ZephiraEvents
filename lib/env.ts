// lib/env.ts

// ==============================
// Imports
// ==============================
// (n/a)

// ==============================
// Types
// ==============================

export type ParseNumberOptions = {
  min?: number;
  max?: number;
};

export type ParseListOptions = {
  separator?: string; // default: ","
  trim?: boolean; // default: true
  nonEmpty?: boolean; // dacă true, filtrează elementele "", default: true
  toLowerCase?: boolean; // dacă true, convertește la lowercase
};

export type ParseEnumOptions = {
  caseInsensitive?: boolean; // default: true
};

// ==============================
// Constante
// ==============================

const TRUE_SET = new Set(["true", "1", "yes", "y", "on"]);
const FALSE_SET = new Set(["false", "0", "no", "n", "off"]);

// ==============================
// Utils interne
// ==============================

function isDev(): boolean {
  return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
}

function devWarn(msg: string, ...args: unknown[]) {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.warn(`[env.ts] ${msg}`, ...args);
  }
}

function toStringOrUndefined(val: unknown): string | undefined {
  if (val == null) return undefined;
  const s = String(val).trim();
  return s === "" ? undefined : s;
}

// ==============================
// API: citire variabile
// ==============================

/** Returnează valoarea unei variabile de mediu (sau undefined). */
export function getEnv(name: string): string | undefined {
  // În Next.js, process.env este înlocuit la build-time; apelul rămâne sigur la runtime.
  return typeof process !== "undefined" ? (process.env?.[name] as string | undefined) : undefined;
}

/** True dacă există variabila și are o valoare ne-goală. */
export function hasEnv(name: string): boolean {
  const v = getEnv(name);
  return typeof v === "string" && v.trim() !== "";
}

/** Returnează valoarea sau aruncă eroare dacă lipsește. */
export function getRequiredEnv(
  name: string,
  { allowEmpty = false, soft = false }: { allowEmpty?: boolean; soft?: boolean } = {},
): string {
  const v = getEnv(name);
  if (v == null || (!allowEmpty && v.trim() === "")) {
    const msg = `Missing required env: ${name}${allowEmpty ? "" : " (non-empty required)"}`;
    if (soft) {
      devWarn(msg);
      return "";
    }
    throw new Error(msg);
  }
  return v;
}

// ==============================
// API: parsere
// ==============================

/** Parsează boolean din env — acceptă: true/1/yes/y/on (și false/0/no/n/off). */
export function parseEnvBool(val: unknown, defaultValue = false): boolean {
  const s = toStringOrUndefined(val);
  if (!s) return defaultValue;
  const low = s.toLowerCase();
  if (TRUE_SET.has(low)) return true;
  if (FALSE_SET.has(low)) return false;
  return defaultValue;
}

/** Parsează număr întreg, cu limite opționale. */
export function parseEnvInt(
  val: unknown,
  defaultValue = 0,
  { min, max }: ParseNumberOptions = {},
): number {
  const s = toStringOrUndefined(val);
  if (!s) return defaultValue;
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n)) return defaultValue;
  if (typeof min === "number" && n < min) return min;
  if (typeof max === "number" && n > max) return max;
  return n;
}

/** Parsează număr în virgulă mobilă, cu limite opționale. */
export function parseEnvNumber(
  val: unknown,
  defaultValue = 0,
  { min, max }: ParseNumberOptions = {},
): number {
  const s = toStringOrUndefined(val);
  if (!s) return defaultValue;
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n)) return defaultValue;
  if (typeof min === "number" && n < min) return min;
  if (typeof max === "number" && n > max) return max;
  return n;
}

/** Parsează listă CSV într-un array de stringuri. */
export function parseEnvList(
  val: unknown,
  { separator = ",", trim = true, nonEmpty = true, toLowerCase = false }: ParseListOptions = {},
): readonly string[] {
  const s = toStringOrUndefined(val);
  if (!s) return [];
  const parts = s.split(separator);
  const out: string[] = [];
  for (let p of parts) {
    if (trim) p = p.trim();
    if (toLowerCase) p = p.toLowerCase();
    if (nonEmpty && p === "") continue;
    out.push(p);
  }
  return out;
}

/** Parsează o valoare în enum-ul permis; dacă nu e validă, întoarce default-ul. */
export function parseEnvEnum<const TAllowed extends readonly string[]>(
  val: unknown,
  allowed: TAllowed,
  defaultValue: TAllowed[number],
  { caseInsensitive = true }: ParseEnumOptions = {},
): TAllowed[number] {
  const s = toStringOrUndefined(val);
  if (!s) return defaultValue;

  if (!caseInsensitive) {
    return (allowed as readonly string[]).includes(s) ? (s as TAllowed[number]) : defaultValue;
  }

  const low = s.toLowerCase();
  const found = (allowed as readonly string[]).find((a) => a.toLowerCase() === low);
  return (found as TAllowed[number]) ?? defaultValue;
}

/** Parsează JSON în tipul așteptat; opțional, validează cu un type-guard. */
export function parseEnvJson<T>(
  val: unknown,
  defaultValue: T,
  validate?: (x: unknown) => x is T,
): T {
  const s = toStringOrUndefined(val);
  if (!s) return defaultValue;
  try {
    const parsed: unknown = JSON.parse(s);
    if (validate) {
      return validate(parsed) ? parsed : defaultValue;
    }
    return parsed as T;
  } catch (err) {
    devWarn("parseEnvJson: invalid JSON:", err);
    return defaultValue;
  }
}

/** Returnează stringul (trim) sau default. */
export function parseEnvString(val: unknown, defaultValue = ""): string {
  const s = toStringOrUndefined(val);
  return s ?? defaultValue;
}

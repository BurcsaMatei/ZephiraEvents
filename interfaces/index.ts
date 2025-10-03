// interfaces/index.ts

// ==============================
// Types
// ==============================

export type JsonPrimitive = string | number | boolean | null;

export type JsonObject = { readonly [key: string]: Json };
export type JsonArray = readonly Json[];

/** JSON imutabil: primitive + obiect + array (recursiv) */
export type Json = JsonPrimitive | JsonObject | JsonArray;

/** Tip simplu pentru exemple (immutabil) */
export interface User {
  readonly id: string;
  readonly name: string;
}

// ==============================
// Utils
// ==============================

/**
 * Verifică dacă o valoare este un obiect simplu (nu null, nu array).
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Guard de tip pentru JSON valid (recursiv).
 * Atenție: Nu detectează cicluri de referință.
 */
export function isJson(value: unknown): value is Json {
  const t = typeof value;
  if (value === null || t === "string" || t === "number" || t === "boolean") return true;

  if (Array.isArray(value)) {
    return value.every(isJson);
  }

  if (isPlainObject(value)) {
    // fiecare valoare din obiect trebuie să fie JSON-validă
    for (const k in value) {
      // folosim hasOwnProperty ca să evităm proprietăți din prototip
      if (Object.prototype.hasOwnProperty.call(value, k)) {
        if (!isJson((value as Record<string, unknown>)[k])) return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Type guard pentru `User` fără `any`.
 */
export function isUser(x: unknown): x is User {
  if (!isPlainObject(x)) return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.name === "string";
}

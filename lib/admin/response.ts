// lib/admin/response.ts
// Helpers pentru format uniform de răspuns în API routes admin.
// Format: { ok: true [, data: T] } | { ok: false, error: string }

export interface ErrResp {
  ok: false;
  error: string;
}

export function okResponse(): { ok: true };
export function okResponse<T>(data: T): { ok: true; data: T };
export function okResponse<T>(data?: T): { ok: true } | { ok: true; data: T } {
  if (data !== undefined) return { ok: true as const, data };
  return { ok: true as const };
}

export function errorResponse(message: string): ErrResp {
  return { ok: false, error: message };
}

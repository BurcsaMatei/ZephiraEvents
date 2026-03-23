// lib/admin/sanitize.ts
// Sanitizare text pentru afișare sigură în admin UI.
// Output: HTML safe — tag-uri strippate, entități escapate.
// Folosit cu dangerouslySetInnerHTML în paginile admin.

export function sanitizeHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")  // strip HTML tags
    .replace(/&/g, "&amp;")    // escape & primul (înainte de celelalte)
    .replace(/</g, "&lt;")     // escape < rămas (e.g., "pret < 100")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\s{2,}/g, " ")   // colapsează spații multiple
    .trim();
}

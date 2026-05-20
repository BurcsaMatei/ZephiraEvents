// lib/menus.ts
// Funcții pure (fără fs/Node.js) — sigure pentru client bundle.
// Funcțiile server-only (fs, GitHub API) sunt în lib/menus.server.ts.

import type { EventType } from "../types/menu";

export function getEventTypeAnchorHref(eventType: EventType): string {
  switch (eventType) {
    case "Nunta":
      return "/servicii#meniuri-nunta";
    case "Botez & Cununie":
      return "/servicii#meniuri-botez-cununie";
    case "Petreceri Private & Majorate":
      return "/servicii#meniuri-petreceri-private-majorate";
    case "Corporate & Team Building":
      return "/servicii#meniuri-corporate-team-building";
    default: {
      const _exhaustive: never = eventType;
      return _exhaustive;
    }
  }
}

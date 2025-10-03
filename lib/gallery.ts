// lib/gallery.ts

// ==============================
// Facade public + bootstrap
// ==============================

import { GALLERY_DATA } from "./gallery.data"; // <-- fișierul tău generat
import { initGallery } from "./gallery.store";
import { parseGalleryItems } from "./gallery/schema";

// Bootstrap la import (idempotent, fără dependențe de browser)
(() => {
  try {
    const items = parseGalleryItems(GALLERY_DATA);
    initGallery(items);
  } catch (err) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[lib/gallery] Nu am putut inițializa galeria din GALLERY_DATA:", err);
    }
  }
})();

// ==============================
// Re-exporturi (tipuri + store + compat)
// ==============================

// Tipuri & schema
export type { GalleryItem, GalleryItemList } from "./gallery/schema";
export { GalleryItemListSchema, GalleryItemSchema, parseGalleryItems } from "./gallery/schema";

// Store & hooks
export {
  galleryActions,
  getCurrent,
  getItems,
  getLength,
  getLoop,
  initGallery,
  useGalleryItems,
  useGalleryStore,
} from "./gallery.store";

// Compat pentru cod existent (ex: ArcGallery.tsx)
export { getItems as getGalleryItems } from "./gallery.store";

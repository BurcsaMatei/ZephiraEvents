// types/blog.ts

// ==============================
// Type aliases
// ==============================
export type Post = {
  slug: string;
  title: string;
  excerpt?: string;
  date: string; // ISO string
  tags?: string[];
  author?: string;

  // imagini — compat cu ambele convenții
  coverImage?: string; // preferat
  cover?: string; // alias vechi
};

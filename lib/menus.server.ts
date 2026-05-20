// lib/menus.server.ts
// Funcții server-only pentru meniuri (fs la build-time + GitHub API la runtime).
// NU importa din componente client sau din pagini fără getStaticProps/getServerSideProps.

import fs from "fs";
import path from "path";

import type { EventType, Menu } from "../types/menu";

// ── Path helper ───────────────────────────────────────────────────────────────

function menusDir(): string {
  return path.join(process.cwd(), "data", "menus");
}

// ── Dev utils ─────────────────────────────────────────────────────────────────

function isDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

function devWarn(msg: string, ...args: unknown[]): void {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.warn(`[lib/menus.server] ${msg}`, ...args);
  }
}

// ── Sync API (fs, SSG build-time) ─────────────────────────────────────────────

function readAllMenusFromDisk(): Menu[] {
  const dir = menusDir();
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== ".gitkeep");
  } catch {
    devWarn("Nu am putut citi directorul %s", dir);
    return [];
  }
  const menus: Menu[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      menus.push(JSON.parse(raw) as Menu);
    } catch {
      devWarn("Nu am putut citi fișierul %s", file);
    }
  }
  return menus;
}

export function getAllMenus(): Menu[] {
  return readAllMenusFromDisk().filter((m) => m.deleted !== true);
}

// Admin: include și meniurile soft-deleted
export function getAllMenusAdmin(): Menu[] {
  return readAllMenusFromDisk();
}

export function getMenusByEventType(eventType: EventType): Menu[] {
  return getAllMenus().filter((m) => m.eventType === eventType);
}

export function getMenuBySlug(
  slug: string,
  opts: { includeDeleted?: boolean } = {},
): Menu | null {
  const filePath = path.join(menusDir(), `${slug}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const menu = JSON.parse(raw) as Menu;
    if (menu.deleted === true && !opts.includeDeleted) return null;
    return menu;
  } catch {
    if (isDev()) devWarn("Nu am găsit meniu pentru slug=%s", slug);
    return null;
  }
}

// ── Async API (GitHub API, runtime SSR/admin) ─────────────────────────────────

export async function getAllMenusFromGit(): Promise<Menu[]> {
  const { listFiles, getFile } = await import("./admin/github");
  const entries = await listFiles("data/menus");
  const jsonFiles = entries.filter(
    (e) => e.type === "file" && e.name.endsWith(".json") && e.name !== ".gitkeep",
  );
  const menus = await Promise.all(
    jsonFiles.map(async (entry) => {
      const { content } = await getFile(entry.path);
      return JSON.parse(content) as Menu;
    }),
  );
  return menus.filter((m) => m.deleted !== true);
}

export async function getMenuBySlugFromGit(slug: string): Promise<Menu | null> {
  const { getFile } = await import("./admin/github");
  try {
    const { content } = await getFile(`data/menus/${slug}.json`);
    const menu = JSON.parse(content) as Menu;
    return menu.deleted === true ? null : menu;
  } catch {
    return null;
  }
}

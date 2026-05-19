// lib/admin/github.ts
// Helper GitHub API (PAT) — persistență fișiere JSON în repo.
// Toate operațiunile sunt server-side only.

const BASE = "https://api.github.com";

function cfg() {
  const pat = process.env.GITHUB_PAT?.trim();
  const owner = process.env.GITHUB_OWNER?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = (process.env.GITHUB_BRANCH ?? "main").trim();

  if (!pat || !owner || !repo) {
    throw new Error(
      "GitHub API: lipsesc GITHUB_PAT, GITHUB_OWNER sau GITHUB_REPO.",
    );
  }

  return { pat, owner, repo, branch };
}

function headers(pat: string): Record<string, string> {
  return {
    Authorization: `Bearer ${pat}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "ZephiraEvents-App",
  };
}

function url(owner: string, repo: string, path: string): string {
  return `${BASE}/repos/${owner}/${repo}/contents/${path}`;
}

// ── createFile ────────────────────────────────────────────────────────────────

export async function createFile(
  path: string,
  content: string,
): Promise<void> {
  const { pat, owner, repo, branch } = cfg();
  const encoded = Buffer.from(content, "utf8").toString("base64");

  const res = await fetch(url(owner, repo, path), {
    method: "PUT",
    headers: headers(pat),
    body: JSON.stringify({
      message: `data: add ${path}`,
      content: encoded,
      branch,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub createFile ${path} → ${res.status}: ${text}`);
  }
}

// ── getFile ───────────────────────────────────────────────────────────────────

export interface GitFile {
  content: string;
  sha: string;
}

export async function getFile(path: string): Promise<GitFile> {
  const { pat, owner, repo, branch } = cfg();

  const res = await fetch(`${url(owner, repo, path)}?ref=${branch}`, {
    headers: headers(pat),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub getFile ${path} → ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { content: string; sha: string };
  const decoded = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString(
    "utf8",
  );

  return { content: decoded, sha: data.sha };
}

// ── updateFile ────────────────────────────────────────────────────────────────

export async function updateFile(
  path: string,
  content: string,
  sha: string,
): Promise<void> {
  const { pat, owner, repo, branch } = cfg();
  const encoded = Buffer.from(content, "utf8").toString("base64");

  const res = await fetch(url(owner, repo, path), {
    method: "PUT",
    headers: headers(pat),
    body: JSON.stringify({
      message: `data: update ${path}`,
      content: encoded,
      sha,
      branch,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub updateFile ${path} → ${res.status}: ${text}`);
  }
}

// ── uploadImage ───────────────────────────────────────────────────────────────
// Creează un fișier binar (imagine) în Git. `base64Content` = base64 pur, fără prefix.

export async function uploadImage(
  path: string,
  base64Content: string,
): Promise<string> {
  const { pat, owner, repo, branch } = cfg();

  const res = await fetch(url(owner, repo, path), {
    method: "PUT",
    headers: headers(pat),
    body: JSON.stringify({
      message: `assets: add ${path}`,
      content: base64Content,
      branch,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub uploadImage ${path} → ${res.status}: ${text}`);
  }

  return path;
}

// ── listFiles ─────────────────────────────────────────────────────────────────

export interface GitFileEntry {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir" | "symlink" | "submodule";
}

export async function listFiles(path: string): Promise<GitFileEntry[]> {
  const { pat, owner, repo, branch } = cfg();

  const res = await fetch(`${url(owner, repo, path)}?ref=${branch}`, {
    headers: headers(pat),
  });

  if (res.status === 404) return [];

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub listFiles ${path} → ${res.status}: ${text}`);
  }

  const data = (await res.json()) as GitFileEntry[];
  return Array.isArray(data) ? data : [];
}

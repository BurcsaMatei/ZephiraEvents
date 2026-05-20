// pages/admin/blog/new.tsx
// Admin — formular creare articol nou.

import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useRef, useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import * as s from "../../../styles/admin/blog.css";

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ă/g, "a").replace(/â/g, "a").replace(/î/g, "i")
    .replace(/ș/g, "s").replace(/ț/g, "t")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: {} };
};

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminBlogNewPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("ZephiraEvents");
  const [tags, setTags] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [content, setContent] = useState("");

  const [imageB64, setImageB64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const previewSlug = titleToSlug(title);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError("Fișierul trebuie să fie o imagine."); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Imaginea trebuie să fie sub 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageB64(result.split(",")[1] ?? "");
      setImageMime(file.type);
      setImagePreview(result);
      setUploadError("");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Titlul este obligatoriu."); return; }
    if (!excerpt.trim()) { setError("Descrierea scurtă este obligatorie."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date: date ? `${date}T09:00:00Z` : new Date().toISOString(),
          excerpt: excerpt.trim(),
          author: author.trim(),
          tags: tags.trim(),
          readingTime: readingTime.trim(),
          content,
        }),
      });
      const data = (await res.json()) as { ok: boolean; data?: { slug: string }; error?: string };
      if (!data.ok) { setError(data.error ?? "Eroare la creare."); return; }

      const slug = data.data?.slug;
      if (imageB64 && imageMime && slug) {
        await fetch(`/api/admin/blog/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "uploadCover", photoBase64: imageB64, photoMime: imageMime }),
        });
      }

      await router.push("/admin/blog");
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Articol nou</h1>
      </div>

      {error && <div className={s.errorMsg}>{error}</div>}

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className={s.formCard}>
          {/* ── Informații generale ── */}
          <div className={s.formSection}>
            <p className={s.formSectionTitle}>Informații generale</p>

            <div className={s.field}>
              <label htmlFor="n-title" className={s.label}>Titlu *</label>
              <input
                id="n-title"
                className={s.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Ghid pentru o nuntă reușită"
                required
              />
              {previewSlug && (
                <span className={s.hint}>Slug: <code>{previewSlug}</code></span>
              )}
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="n-date" className={s.label}>Data publicării</label>
                <input
                  id="n-date"
                  type="date"
                  className={s.input}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className={s.field}>
                <label htmlFor="n-author" className={s.label}>Autor</label>
                <input
                  id="n-author"
                  className={s.input}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="ZephiraEvents"
                />
              </div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="n-tags" className={s.label}>Tag-uri (virgulă separare)</label>
                <input
                  id="n-tags"
                  className={s.input}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="nunti, planificare, decor"
                />
              </div>
              <div className={s.field}>
                <label htmlFor="n-reading-time" className={s.label}>Timp citire</label>
                <input
                  id="n-reading-time"
                  className={s.input}
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="5 min"
                />
              </div>
            </div>

            <div className={s.field}>
              <label htmlFor="n-excerpt" className={s.label}>Descriere scurtă * (meta description, 80–170 caractere)</label>
              <textarea
                id="n-excerpt"
                className={s.textarea}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Rezumat scurt al articolului pentru SEO și preview..."
              />
              <span className={s.hint}>{excerpt.length} / 170 caractere</span>
            </div>
          </div>

          {/* ── Cover imagine ── */}
          <div className={s.formSection}>
            <p className={s.formSectionTitle}>Cover imagine</p>
            <div className={s.imgPreviewWrap}>
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className={s.imgPreview} />
              ) : (
                <div className={s.imgPlaceholder}>🖼</div>
              )}
              <div>
                <button type="button" className={s.uploadBtn} onClick={() => fileRef.current?.click()}>
                  {imagePreview ? "Schimbă imaginea" : "Alege imagine"}
                </button>
                <p className={s.hint}>WebP generat automat. Max 5 MB.</p>
                {uploadError && <p className={s.uploadStatusError}>{uploadError}</p>}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  aria-label="Alege cover articol"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* ── Conținut ── */}
          <div className={s.formSection}>
            <p className={s.formSectionTitle}>Conținut articol</p>
            <p className={s.hint} style={{ marginBottom: "12px" }}>HTML sau Markdown. Heading-urile se shiftează automat +1 nivel la afișare.</p>
            <div className={s.field}>
              <label htmlFor="n-content" className={s.label}>Conținut</label>
              <textarea
                id="n-content"
                className={s.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                placeholder={"<p>Introducere...</p>\n<h2>Secțiune</h2>\n<p>Detalii...</p>"}
              />
            </div>
          </div>

          <div className={s.actions}>
            <button type="submit" className={s.submitBtn} disabled={saving}>
              {saving ? "Se salvează..." : "Creează articol"}
            </button>
            <Link href="/admin/blog" className={s.cancelLink}>Anulează</Link>
          </div>
        </div>
      </form>
    </>
  );
}

AdminBlogNewPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

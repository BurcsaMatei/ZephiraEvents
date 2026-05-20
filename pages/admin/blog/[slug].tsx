// pages/admin/blog/[slug].tsx
// Admin — formular editare articol existent + upload cover.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useRef, useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { type BlogPostAdmin,getPostBySlugAdmin } from "../../../lib/blog.server";
import * as s from "../../../styles/admin/blog.css";

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<{ post: BlogPostAdmin }> = async ({ req, params }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  const slug = String(Array.isArray(params?.["slug"]) ? params["slug"][0] : (params?.["slug"] ?? ""));
  const post = getPostBySlugAdmin(slug);
  if (!post) return { notFound: true };
  return { props: { post } };
};

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminBlogEditPage({
  post: initial,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date.slice(0, 10));
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [author, setAuthor] = useState(initial.author ?? "");
  const [tags, setTags] = useState((initial.tags ?? []).join(", "));
  const [readingTime, setReadingTime] = useState(initial.readingTime ?? "");
  const [content, setContent] = useState(initial.contentHtml);

  const [currentCover, setCurrentCover] = useState(initial.coverImage ?? "");
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handleUploadCover() {
    if (!imageB64 || !imageMime) return;
    setSaving(true);
    setUploadStatus("");
    setUploadError("");
    try {
      const res = await fetch(`/api/admin/blog/${initial.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "uploadCover", photoBase64: imageB64, photoMime: imageMime }),
      });
      const data = (await res.json()) as { ok: boolean; data?: { coverImage: string }; error?: string };
      if (data.ok && data.data) {
        setCurrentCover(data.data.coverImage);
        setUploadStatus("Cover salvat.");
        setImageB64(null);
        setImagePreview(null);
      } else {
        setUploadError(data.error ?? "Eroare la upload.");
      }
    } catch {
      setUploadError("Eroare de rețea la upload.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Titlul este obligatoriu."); return; }
    if (!excerpt.trim()) { setError("Descrierea scurtă este obligatorie."); return; }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/blog/${initial.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date: date ? `${date}T09:00:00Z` : initial.date,
          excerpt: excerpt.trim(),
          author: author.trim(),
          tags: tags.trim(),
          readingTime: readingTime.trim(),
          content,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Eroare la salvare.");
      } else {
        setSuccess("Salvat cu succes.");
        setTimeout(() => void router.push("/admin/blog"), 1200);
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Editare: {initial.title}</h1>
      </div>

      {success && <div className={s.successMsg}>{success}</div>}
      {error && <div className={s.errorMsg}>{error}</div>}

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className={s.formCard}>
          {/* ── Informații generale ── */}
          <div className={s.formSection}>
            <p className={s.formSectionTitle}>Informații generale</p>

            <div className={s.field}>
              <label htmlFor="e-title" className={s.label}>Titlu *</label>
              <input
                id="e-title"
                className={s.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className={s.hint}>Slug: <code>{initial.slug}</code> (imuabil după creare)</span>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="e-date" className={s.label}>Data publicării</label>
                <input
                  id="e-date"
                  type="date"
                  className={s.input}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className={s.field}>
                <label htmlFor="e-author" className={s.label}>Autor</label>
                <input
                  id="e-author"
                  className={s.input}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="e-tags" className={s.label}>Tag-uri (virgulă separare)</label>
                <input
                  id="e-tags"
                  className={s.input}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="nunti, planificare, decor"
                />
              </div>
              <div className={s.field}>
                <label htmlFor="e-reading-time" className={s.label}>Timp citire</label>
                <input
                  id="e-reading-time"
                  className={s.input}
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="5 min"
                />
              </div>
            </div>

            <div className={s.field}>
              <label htmlFor="e-excerpt" className={s.label}>Descriere scurtă * (80–170 caractere)</label>
              <textarea
                id="e-excerpt"
                className={s.textarea}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
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
                <img src={imagePreview} alt="Preview nou" className={s.imgPreview} />
              ) : currentCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentCover} alt="Cover curent" className={s.imgPreview} />
              ) : (
                <div className={s.imgPlaceholder}>🖼</div>
              )}
              <div>
                <button type="button" className={s.uploadBtn} onClick={() => fileRef.current?.click()}>
                  Alege imagine nouă
                </button>
                {imageB64 && (
                  <button
                    type="button"
                    className={s.submitBtn}
                    style={{ marginLeft: "8px" }}
                    disabled={saving}
                    onClick={() => void handleUploadCover()}
                  >
                    {saving ? "Upload..." : "Salvează cover"}
                  </button>
                )}
                <p className={s.hint}>WebP generat automat. Max 5 MB.</p>
                {uploadStatus && <p className={s.uploadStatus}>{uploadStatus}</p>}
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
              <label htmlFor="e-content" className={s.label}>Conținut</label>
              <textarea
                id="e-content"
                className={s.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={24}
              />
            </div>
          </div>

          <div className={s.actions}>
            <button type="submit" className={s.submitBtn} disabled={saving}>
              {saving ? "Se salvează..." : "Salvează modificările"}
            </button>
            <Link href="/admin/blog" className={s.cancelLink}>Anulează</Link>
          </div>
        </div>
      </form>
    </>
  );
}

AdminBlogEditPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

// pages/admin/menus/[slug].tsx
// Admin — formular editare meniu existent + upload imagine.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import { getMenuBySlug } from "../../../lib/menus.server";
import * as s from "../../../styles/admin/menus.css";
import type { Menu } from "../../../types/menu";
import { EVENT_TYPES } from "../../../types/menu";

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<{ menu: Menu }> = async ({ req, params }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  const slug = String(Array.isArray(params?.["slug"]) ? params["slug"][0] : (params?.["slug"] ?? ""));
  const menu = getMenuBySlug(slug, { includeDeleted: true });
  if (!menu) return { notFound: true };
  return { props: { menu } };
};

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function parseLines(val: string): string[] {
  return val.split("\n").map((l) => l.trim()).filter(Boolean);
}
function linesToText(arr: string[]): string {
  return arr.join("\n");
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminMenuEditPage({
  menu: initial,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initial.title);
  const [eventType, setEventType] = useState<Menu["eventType"]>(initial.eventType);
  const [pricePerPers, setPricePerPers] = useState(String(initial.pricePerPers));
  const [currency, setCurrency] = useState(initial.currency);
  const [imageAlt, setImageAlt] = useState(initial.imageAlt);

  const [starterRece, setStarterRece] = useState(linesToText(initial.sections.starterRece));
  const [antreuCald, setAntreuCald] = useState(initial.sections.antreuCald);
  const [felIntermediar, setFelIntermediar] = useState(initial.sections.felIntermediar);
  const [felPrincipal, setFelPrincipal] = useState(
    linesToText(
      Array.isArray(initial.sections.felPrincipal)
        ? initial.sections.felPrincipal
        : [initial.sections.felPrincipal],
    ),
  );
  const [pachetBar, setPachetBar] = useState(linesToText(initial.sections.pachetBar));

  const [currentImage, setCurrentImage] = useState(initial.image);
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

  async function handleUploadImage() {
    if (!imageB64 || !imageMime) return;
    setSaving(true);
    setUploadStatus("");
    setUploadError("");
    try {
      const res = await fetch(`/api/admin/menus/${initial.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "uploadImage", photoBase64: imageB64, photoMime: imageMime }),
      });
      const data = (await res.json()) as { ok: boolean; data?: { imageUrl: string }; error?: string };
      if (data.ok && data.data) {
        setCurrentImage(data.data.imageUrl);
        setUploadStatus("Imagine salvată.");
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
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/menus/${initial.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          eventType,
          pricePerPers: Number(pricePerPers) || 0,
          currency,
          imageAlt: imageAlt.trim(),
          starterRece: parseLines(starterRece),
          antreuCald: antreuCald.trim(),
          felIntermediar: felIntermediar.trim(),
          felPrincipal: parseLines(felPrincipal),
          pachetBar: parseLines(pachetBar),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Eroare la salvare.");
      } else {
        setSuccess("Salvat cu succes.");
        setTimeout(() => void router.push("/admin/menus"), 1200);
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Editare: {initial.title}</h1>
      </div>

      {success && <div className={s.successMsg}>{success}</div>}
      {error && <div className={s.errorMsg}>{error}</div>}

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className={s.formCard}>
          {/* ── Informații de bază ── */}
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
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="e-event-type" className={s.label}>Tip eveniment *</label>
                <select
                  id="e-event-type"
                  className={s.select}
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as Menu["eventType"])}
                >
                  {EVENT_TYPES.map((et) => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>
              <div className={s.field}>
                <label htmlFor="e-price" className={s.label}>Preț / pers.</label>
                <input
                  id="e-price"
                  className={s.input}
                  type="number"
                  min="0"
                  value={pricePerPers}
                  onChange={(e) => setPricePerPers(e.target.value)}
                />
              </div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="e-currency" className={s.label}>Monedă</label>
                <select
                  id="e-currency"
                  className={s.select}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="EUR">EUR</option>
                  <option value="RON">RON</option>
                </select>
              </div>
              <div className={s.field}>
                <label htmlFor="e-image-alt" className={s.label}>Alt text imagine</label>
                <input
                  id="e-image-alt"
                  className={s.input}
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Imagine ── */}
          <div className={s.formSection}>
            <p className={s.formSectionTitle}>Imagine meniu</p>
            <div className={s.imgPreviewWrap}>
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview nou" className={s.imgPreview} />
              ) : currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentImage} alt={imageAlt || "Imagine curentă"} className={s.imgPreview} />
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
                    onClick={() => void handleUploadImage()}
                  >
                    {saving ? "Upload..." : "Salvează imaginea"}
                  </button>
                )}
                <p className={s.hint}>WebP generat automat. Max 5 MB.</p>
                {uploadStatus && <p className={s.uploadStatus}>{uploadStatus}</p>}
                {uploadError && <p className={s.uploadStatusError}>{uploadError}</p>}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  aria-label="Alege imagine meniu"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* ── Secțiuni meniu ── */}
          <div className={s.formSection}>
            <p className={s.formSectionTitle}>Secțiuni meniu</p>
            <p className={s.hint} style={{ marginBottom: "16px" }}>Fiecare rând = un element din listă.</p>

            <div className={s.field}>
              <label htmlFor="e-starter-rece" className={s.label}>Starter rece (un element / rând)</label>
              <textarea
                id="e-starter-rece"
                className={s.textarea}
                value={starterRece}
                onChange={(e) => setStarterRece(e.target.value)}
                rows={6}
              />
            </div>

            <div className={s.field}>
              <label htmlFor="e-antreu-cald" className={s.label}>Antreu cald</label>
              <input
                id="e-antreu-cald"
                className={s.input}
                value={antreuCald}
                onChange={(e) => setAntreuCald(e.target.value)}
              />
            </div>

            <div className={s.field}>
              <label htmlFor="e-fel-intermediar" className={s.label}>Fel intermediar</label>
              <input
                id="e-fel-intermediar"
                className={s.input}
                value={felIntermediar}
                onChange={(e) => setFelIntermediar(e.target.value)}
              />
            </div>

            <div className={s.field}>
              <label htmlFor="e-fel-principal" className={s.label}>Fel principal (un element / rând)</label>
              <textarea
                id="e-fel-principal"
                className={s.textarea}
                value={felPrincipal}
                onChange={(e) => setFelPrincipal(e.target.value)}
                rows={4}
              />
            </div>

            <div className={s.field}>
              <label htmlFor="e-pachet-bar" className={s.label}>Pachet bar (un element / rând)</label>
              <textarea
                id="e-pachet-bar"
                className={s.textarea}
                value={pachetBar}
                onChange={(e) => setPachetBar(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className={s.actions}>
            <button type="submit" className={s.submitBtn} disabled={saving}>
              {saving ? "Se salvează..." : "Salvează modificările"}
            </button>
            <Link href="/admin/menus" className={s.cancelLink}>Anulează</Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

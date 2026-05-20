// pages/admin/menus/new.tsx
// Admin — formular adăugare meniu nou.

import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

import AdminLayout from "../../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../../lib/admin/auth";
import * as s from "../../../styles/admin/menus.css";
import type { Menu } from "../../../types/menu";
import { EVENT_TYPES } from "../../../types/menu";

// ──────────────────────────────────────────────────────────
// SSR — verificare sesiune
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: {} };
};

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function parseLines(val: string): string[] {
  return val
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
export default function AdminMenuNewPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<Menu["eventType"]>("Nunta");
  const [pricePerPers, setPricePerPers] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [imageAlt, setImageAlt] = useState("");

  const [starterRece, setStarterRece] = useState("");
  const [antreuCald, setAntreuCald] = useState("");
  const [felIntermediar, setFelIntermediar] = useState("");
  const [felPrincipal, setFelPrincipal] = useState("");
  const [pachetBar, setPachetBar] = useState("");

  const [imageB64, setImageB64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Fișierul trebuie să fie o imagine."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Imaginea trebuie să fie sub 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageB64(result.split(",")[1] ?? "");
      setImageMime(file.type);
      setImagePreview(result);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Titlul este obligatoriu."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          eventType,
          pricePerPers: Number(pricePerPers) || 0,
          currency,
          imageAlt: imageAlt.trim(),
          sections: {
            starterRece: parseLines(starterRece),
            antreuCald: antreuCald.trim(),
            felIntermediar: felIntermediar.trim(),
            felPrincipal: parseLines(felPrincipal),
            pachetBar: parseLines(pachetBar),
          },
        }),
      });
      const data = (await res.json()) as { ok: boolean; data?: Menu; error?: string };
      if (!data.ok) { setError(data.error ?? "Eroare la creare."); return; }
      const slug = data.data?.slug;
      if (imageB64 && imageMime && slug) {
        await fetch(`/api/admin/menus/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "uploadImage", photoBase64: imageB64, photoMime: imageMime }),
        });
      }
      await router.push("/admin/menus");
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Meniu nou</h1>
      </div>

      {error && <div className={s.errorMsg}>{error}</div>}

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className={s.formCard}>
          {/* ── Informații de bază ── */}
          <div className={s.formSection}>
            <p className={s.formSectionTitle}>Informații generale</p>

            <div className={s.field}>
              <label htmlFor="n-title" className={s.label}>Titlu *</label>
              <input
                id="n-title"
                className={s.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Oferta Meniu Basic"
                required
              />
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="n-event-type" className={s.label}>Tip eveniment *</label>
                <select
                  id="n-event-type"
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
                <label htmlFor="n-price" className={s.label}>Preț / pers.</label>
                <input
                  id="n-price"
                  className={s.input}
                  type="number"
                  min="0"
                  value={pricePerPers}
                  onChange={(e) => setPricePerPers(e.target.value)}
                  placeholder="ex: 56"
                />
              </div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label htmlFor="n-currency" className={s.label}>Monedă</label>
                <select
                  id="n-currency"
                  className={s.select}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="EUR">EUR</option>
                  <option value="RON">RON</option>
                </select>
              </div>
              <div className={s.field}>
                <label htmlFor="n-image-alt" className={s.label}>Alt text imagine</label>
                <input
                  id="n-image-alt"
                  className={s.input}
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Descriere scurtă a imaginii"
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
                <img src={imagePreview} alt="Preview" className={s.imgPreview} />
              ) : (
                <div className={s.imgPlaceholder}>🖼</div>
              )}
              <div>
                <button type="button" className={s.uploadBtn} onClick={() => fileRef.current?.click()}>
                  {imagePreview ? "Schimbă imaginea" : "Alege imagine"}
                </button>
                <p className={s.hint}>WebP generat automat. Max 5 MB.</p>
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
            <p className={s.hint} style={{ marginBottom: "16px" }}>
              Fiecare rând = un element din listă.
            </p>

            <div className={s.field}>
              <label htmlFor="n-starter-rece" className={s.label}>Starter rece (un element / rând)</label>
              <textarea
                id="n-starter-rece"
                className={s.textarea}
                value={starterRece}
                onChange={(e) => setStarterRece(e.target.value)}
                placeholder={"Terina de pui cu brânzeturi\nEvantai de mușchi file\n..."}
                rows={6}
              />
            </div>

            <div className={s.field}>
              <label htmlFor="n-antreu-cald" className={s.label}>Antreu cald</label>
              <input
                id="n-antreu-cald"
                className={s.input}
                value={antreuCald}
                onChange={(e) => setAntreuCald(e.target.value)}
                placeholder="ex: File de șalău pe pat de risotto..."
              />
            </div>

            <div className={s.field}>
              <label htmlFor="n-fel-intermediar" className={s.label}>Fel intermediar</label>
              <input
                id="n-fel-intermediar"
                className={s.input}
                value={felIntermediar}
                onChange={(e) => setFelIntermediar(e.target.value)}
                placeholder="ex: Sărmăluțe în frunză de varză..."
              />
            </div>

            <div className={s.field}>
              <label htmlFor="n-fel-principal" className={s.label}>Fel principal (un element / rând)</label>
              <textarea
                id="n-fel-principal"
                className={s.textarea}
                value={felPrincipal}
                onChange={(e) => setFelPrincipal(e.target.value)}
                placeholder={"Buturugă de porc cu sos brun\nRulouri de pui în bacon\n..."}
                rows={4}
              />
            </div>

            <div className={s.field}>
              <label htmlFor="n-pachet-bar" className={s.label}>Pachet bar (un element / rând)</label>
              <textarea
                id="n-pachet-bar"
                className={s.textarea}
                value={pachetBar}
                onChange={(e) => setPachetBar(e.target.value)}
                placeholder={"Apă plată / minerală — nelimitat\nCola / Fanta — nelimitat\n..."}
                rows={4}
              />
            </div>
          </div>

          <div className={s.actions}>
            <button type="submit" className={s.submitBtn} disabled={saving}>
              {saving ? "Se salvează..." : "Creează meniu"}
            </button>
            <Link href="/admin/menus" className={s.cancelLink}>Anulează</Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

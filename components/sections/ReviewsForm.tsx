// components/sections/ReviewsForm.tsx
// ==============================
// Reviews Form — with client-side Blob uploads (avatar + photos)
// ==============================

"use client";

import { useCallback, useMemo, useState } from "react";

import { uploadFileViaSignedUrl } from "../../lib/blob";
import {
  actionsClass,
  avatarPreviewClass,
  fileHintClass,
  filesPreviewClass,
  formClass,
  inputClass,
  labelClass,
  ratingRowClass,
  rowClass,
  srOnly,
  starActiveClass,
  starBtnClass,
  starsGroupClass,
  textareaClass,
} from "../../styles/sections/reviewsForm.css";

type Props = {
  onCreated?: (opts: { refresh?: boolean }) => void;
};

export default function ReviewsForm({ onCreated }: Props) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);

  // Client-side uploads → URLs
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const canSubmit = useMemo(() => {
    return (
      authorName.trim().length >= 2 &&
      text.trim().length >= 10 &&
      rating >= 1 &&
      rating <= 5 &&
      !busy
    );
  }, [authorName, text, rating, busy]);

  const handleAvatarSelect = useCallback(async (file: File | null) => {
    setAvatarFile(file);
    setAvatarUrl(undefined);
    if (!file) return;
    if (!/^image\//.test(file.type) || file.size > 5 * 1024 * 1024) {
      alert("Avatar invalid (doar imagine, max 5MB).");
      return;
    }
    try {
      const url = await uploadFileViaSignedUrl(file, "reviews-avatars");
      setAvatarUrl(url);
    } catch (e) {
      alert((e as Error).message);
    }
  }, []);

  const handlePhotosSelect = useCallback(async (files: FileList | null) => {
    setPhotoFiles([]);
    setPhotoUrls([]);
    if (!files || !files.length) return;
    const arr = Array.from(files).slice(0, 4);
    const accepted: File[] = [];
    for (const f of arr) {
      if (!/^image\//.test(f.type) || f.size > 5 * 1024 * 1024) continue;
      accepted.push(f);
    }
    setPhotoFiles(accepted);
    const urls: string[] = [];
    for (const f of accepted) {
      try {
        const u = await uploadFileViaSignedUrl(f, "reviews-photos");
        urls.push(u);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
    setPhotoUrls(urls);
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName,
          rating,
          text,
          honeypot,
          profilePhotoUrl: avatarUrl, // optional
          photos: photoUrls, // optional
        }),
      });
      const json = (await res.json()) as { ok: boolean };
      if (!res.ok || !json.ok) throw new Error("Nu am putut publica recenzia.");
      // reset
      setAuthorName("");
      setRating(5);
      setText("");
      setHoneypot("");
      setAvatarFile(null);
      setAvatarUrl(undefined);
      setPhotoFiles([]);
      setPhotoUrls([]);
      onCreated?.({ refresh: true });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [authorName, rating, text, honeypot, avatarUrl, photoUrls, canSubmit, onCreated]);

  return (
    <form
      className={formClass}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      aria-label="Formular recenzie"
    >
      {/* Honeypot */}
      <div style={{ display: "none" }}>
        <label>
          Company
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
          />
        </label>
      </div>

      <div className={rowClass}>
        <label className={labelClass} htmlFor="authorName">
          Nume și prenume
        </label>
        <input
          id="authorName"
          className={inputClass}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
          maxLength={100}
          autoComplete="name"
          placeholder="ex: Andrei Pop"
        />
      </div>

      {/* Rating cu stele (1–5) */}
      <div className={ratingRowClass} role="radiogroup" aria-label="Alege ratingul">
        <span className={srOnly} id="rating-label">
          Rating (1–5)
        </span>
        <div className={starsGroupClass} aria-labelledby="rating-label">
          {[1, 2, 3, 4, 5].map((v) => {
            const active = v <= rating;
            return (
              <button
                key={v}
                type="button"
                className={`${starBtnClass} ${active ? starActiveClass : ""}`}
                aria-pressed={active}
                aria-label={`${v} stele`}
                onClick={() => setRating(v)}
              >
                ★
              </button>
            );
          })}
        </div>
        {/* Input ascuns pentru compatibilitate/validare (dacă e nevoie) */}
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div className={rowClass}>
        <label className={labelClass} htmlFor="text">
          Recenzia ta
        </label>
        <textarea
          id="text"
          className={textareaClass}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={2000}
          placeholder="Cum a fost experiența ta?"
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass} htmlFor="avatar">
          Poză profil (opțional)
        </label>
        <input
          id="avatar"
          className={inputClass}
          type="file"
          accept="image/*"
          onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
        />
        {avatarUrl && (
          <div className={avatarPreviewClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="Avatar încărcat" />
          </div>
        )}
        <p className={fileHintClass}>Doar imagini, max 5MB.</p>
      </div>

      <div className={rowClass}>
        <label className={labelClass} htmlFor="photos">
          Imagini recenzie (0–4)
        </label>
        <input
          id="photos"
          className={inputClass}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handlePhotosSelect(e.target.files)}
        />
        {photoUrls.length > 0 && (
          <div className={filesPreviewClass}>
            {photoUrls.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={u} src={u} alt="Imagine încărcată" />
            ))}
          </div>
        )}
        <p className={fileHintClass}>Max 4 imagini, fiecare ≤5MB.</p>
      </div>

      <div className={actionsClass}>
        <button type="submit" disabled={!canSubmit || busy}>
          {busy ? "Public..." : "Publică recenzia"}
        </button>
      </div>
    </form>
  );
}

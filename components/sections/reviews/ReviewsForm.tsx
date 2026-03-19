// components/sections/reviews/ReviewsForm.tsx
// ==============================
// Reviews Form — trimite recenzia prin email (fără storage)
// ==============================

"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  actionsClass,
  avatarPreviewClass,
  fileHintClass,
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
} from "../../../styles/sections/reviews/reviewsForm.css";

type Props = {
  onCreated?: () => void;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Eroare la citirea fișierului."));
    reader.readAsDataURL(file);
  });
}

export default function ReviewsForm({ onCreated }: Props) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(
    () =>
      authorName.trim().length >= 2 &&
      text.trim().length >= 10 &&
      rating >= 1 &&
      rating <= 5 &&
      !busy,
    [authorName, text, rating, busy],
  );

  const handleAvatarSelect = useCallback((file: File | null) => {
    setAvatarFile(file);
    setAvatarPreview(null);
    if (!file) return;
    if (!/^image\//.test(file.type) || file.size > 5 * 1024 * 1024) {
      alert("Poza trebuie să fie o imagine de maxim 5MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);

    try {
      let photoBase64: string | undefined;
      let photoMime: string | undefined;
      let photoFilename: string | undefined;

      if (avatarFile) {
        photoBase64 = await fileToBase64(avatarFile);
        photoMime = avatarFile.type;
        photoFilename = avatarFile.name;
      }

      const body: Record<string, unknown> = {
        name: authorName,
        rating,
        text,
        honeypot,
      };
      if (photoBase64) {
        body.photoBase64 = photoBase64;
        body.photoMime = photoMime;
        body.photoFilename = photoFilename;
      }

      const res = await fetch("/api/review-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "Nu am putut trimite recenzia.");
      }

      // reset
      setAuthorName("");
      setRating(5);
      setText("");
      setHoneypot("");
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setDone(true);
      onCreated?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [authorName, rating, text, honeypot, avatarFile, canSubmit, onCreated]);

  if (done) {
    return (
      <div className={formClass} role="status">
        <p>
          <strong>Mulțumim pentru recenzie!</strong> O vom publica după verificare.
        </p>
      </div>
    );
  }

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
        <label className={labelClass} htmlFor="rv-name">
          Nume și prenume
        </label>
        <input
          id="rv-name"
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
        <span className={srOnly} id="rv-rating-label">
          Rating (1–5)
        </span>
        <div className={starsGroupClass} aria-labelledby="rv-rating-label">
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
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div className={rowClass}>
        <label className={labelClass} htmlFor="rv-text">
          Recenzia ta
        </label>
        <textarea
          id="rv-text"
          className={textareaClass}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={2000}
          placeholder="Cum a fost experiența ta?"
        />
      </div>

      <div className={rowClass}>
        <label className={labelClass} htmlFor="rv-avatar">
          Poză de profil (opțional)
        </label>
        <input
          ref={fileInputRef}
          id="rv-avatar"
          className={inputClass}
          type="file"
          accept="image/*"
          onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
        />
        {avatarPreview && (
          <div className={avatarPreviewClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarPreview} alt="Previzualizare poză profil" />
          </div>
        )}
        <p className={fileHintClass}>
          Imagine, max 5MB. Ajunge ca atașament — o salvăm noi manual.
        </p>
      </div>

      <div aria-live="polite" style={{ minHeight: 20 }}>
        {error && (
          <span role="alert" style={{ color: "var(--danger, #cc3b3b)" }}>
            {error}
          </span>
        )}
      </div>

      <div className={actionsClass}>
        <button type="submit" disabled={!canSubmit || busy}>
          {busy ? "Se trimite..." : "Trimite recenzia"}
        </button>
      </div>
    </form>
  );
}

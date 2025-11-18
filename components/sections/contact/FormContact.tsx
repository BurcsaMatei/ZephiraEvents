// components/sections/contact/FormContact.tsx

"use client";

// ==============================
// Imports
// ==============================
import React, { useEffect, useRef, useState } from "react";

import { CONTACT, withBase } from "../../../lib/config";
import * as s from "../../../styles/contact/FormContact.css";
import Appear from "../../animations/Appear";
import Button from "../../Button";
import AnimatedIcon from "../../ui/AnimatedIcon";

// ==============================
// Types
// ==============================
type ApiResponse = { ok: true } | { ok: false; code: number; message: string };

// ==============================
// Component
// ==============================
export default function FormContact() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const widgetLoaded = useRef(false);
  const contactPhone = CONTACT.phone.trim();
  const contactWhatsappHref = `https://wa.me/${contactPhone.replace(/[^\d]/g, "")}`;

  // Load reCAPTCHA v2 (checkbox)
  useEffect(() => {
    if (widgetLoaded.current) return;
    const hasScript = !!document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.google.com/recaptcha/api.js"]',
    );
    if (!hasScript) {
      const sc = document.createElement("script");
      sc.src = "https://www.google.com/recaptcha/api.js";
      sc.async = true;
      sc.defer = true;
      document.head.appendChild(sc);
    }
    widgetLoaded.current = true;
  }, []);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    const f = formRef.current;
    if (!f) return;

    const fd = new FormData(f);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const hpt = String(fd.get("_hpt") || ""); // honeypot (must be empty)

    // pick up v2 checkbox token injected by reCAPTCHA — SCOPED LA FORMULAR
    const recaptchaEl = f.querySelector<HTMLTextAreaElement>(
      'textarea[name="g-recaptcha-response"]',
    );
    const recaptchaToken = (recaptchaEl?.value || "").trim();

    // basic client-side guards (server re-validates)
    if (!name || !email || !message) {
      setSending(false);
      setError("Te rugăm să completezi toate câmpurile obligatorii.");
      return;
    }
    if (!recaptchaToken) {
      setSending(false);
      setError("Te rugăm să confirmi că nu ești robot (reCAPTCHA).");
      return;
    }

    try {
      const res = await fetch(withBase("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, recaptchaToken, _hpt: hpt }),
      });
      const data = (await res.json()) as ApiResponse;

      if (!res.ok || data.ok === false) {
        const msg = data.ok === false ? data.message : "A apărut o eroare la trimitere.";
        setError(msg);
        setSending(false);
        return;
      }

      setDone(true);
      setSending(false);
      f.reset();
    } catch {
      setError("Nu am putut trimite mesajul. Încearcă din nou.");
      setSending(false);
    }
  };

  return (
    <div className={s.wrap} aria-labelledby="contact-form-title">
      {/* Col stânga – FORMULAR */}
      <Appear as="div" className={s.col}>
        <form ref={formRef} className={s.formBox} onSubmit={onSubmit} noValidate>
          <h2 id="contact-form-title" className={s.formTitle}>
            Trimite-ne un mesaj
          </h2>

          <div className={s.formFields}>
            <label>
              Nume
              <input
                name="name"
                type="text"
                required
                placeholder="Numele tău"
                className={s.input}
                maxLength={128}
                autoComplete="name"
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                required
                placeholder="email@exemplu.com"
                className={s.input}
                maxLength={160}
                autoComplete="email"
              />
            </label>

            <label>
              Mesaj
              <textarea
                name="message"
                rows={6}
                required
                placeholder="Spune-ne pe scurt despre proiect"
                className={s.textarea}
                maxLength={5000}
              />
            </label>

            {/* Honeypot (must stay empty) */}
            <input
              type="text"
              name="_hpt"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", left: "-5000px", width: 0, height: 0 }}
              aria-hidden="true"
            />

            {/* reCAPTCHA v2 checkbox */}
            <div
              className="g-recaptcha"
              data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
            />
          </div>

          <div aria-live="polite" style={{ minHeight: 20, marginTop: 6 }}>
            {error && (
              <span role="status" style={{ color: "var(--danger, #cc3b3b)" }}>
                {error}
              </span>
            )}
            {done && !error && (
              <span role="status">
                Mulțumim! Mesajul tău a fost trimis. Îți răspundem cât de repede.
              </span>
            )}
          </div>

          <div className={s.submitRow}>
            <Button type="submit" disabled={sending}>
              {sending ? "Se trimite..." : "Trimite"}
            </Button>
          </div>
        </form>
      </Appear>

      {/* Col dreapta – CARD informații */}
      <Appear as="div" className={`${s.col} ${s.infoCol}`} delay={0.12}>
        <div className={s.infoCard} data-card-root>
          <header className={s.infoHead}>
            <h3 className={s.infoTitle}>Răspundem rapid</h3>
            <p className={s.infoSub}>SLA / timp de răspuns & canale alternative</p>
          </header>

          {/* listă cu puncte */}
          <div className={s.list}>
            <div className={s.listItem}>
              <AnimatedIcon src={withBase("/icons/contact/clock.svg")} size={22} hoverTilt />
              <p className={s.itemText}>
                <strong>Timp de răspuns:</strong> 24–48h în zile lucrătoare.
              </p>
            </div>

            <div className={s.listItem}>
              <AnimatedIcon src={withBase("/icons/contact/calendar.svg")} size={22} hoverTilt />
              <p className={s.itemText}>
                <strong>Program:</strong> Luni–Vineri 09:00–18:00, Sâmbătă–Duminică — după caz.
              </p>
            </div>

            <div className={s.listItem}>
              <AnimatedIcon src={withBase("/icons/contact/whatsapp.svg")} size={22} hoverTilt />
              <p className={s.itemText}>
                Urgent? Scrie-ne pe WhatsApp:{" "}
                <a href={contactWhatsappHref} aria-label="Scrie pe WhatsApp">
                  {contactPhone}
                </a>
              </p>
            </div>
          </div>

          {/* mini-card de download ghid */}
          <a
            className={s.miniCard}
            href={withBase("/downloads/ghid-pregatire-continut.pdf")}
            download
            aria-label="Descarcă Ghid pregătire conținut (PDF)"
          >
            <AnimatedIcon src={withBase("/icons/contact/download.svg")} size={22} hoverTilt />
            <div>
              <strong>Ghid pregătire conținut</strong>
              <div className={s.note}>PDF — checklist rapid pentru texte & imagini</div>
            </div>
          </a>

          {/* notă GDPR / privacy */}
          <p className={s.note}>
            <AnimatedIcon src={withBase("/icons/contact/shield.svg")} size={18} hoverTilt /> Folosim
            datele doar pentru a reveni la mesajul tău. Nu trimitem spam și nu partajăm datele cu
            terți.
          </p>
        </div>
      </Appear>
    </div>
  );
}

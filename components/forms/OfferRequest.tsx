// components/forms/OfferRequest.tsx
// ==============================
// Imports
// ==============================
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { withBase } from "../../lib/config";
import {
  EVENT_TYPES_SELECT,
  type EventTypeSlug,
  getEventTypeAnchorHref,
  getMenusForEventType,
} from "../../lib/menus.public";
import * as s from "../../styles/forms/offerRequest.css";
import Button from "../Button";

// ==============================
// Types
// ==============================
type ApiOk = { ok: true };
type ApiFail = { ok: false; message: string };
type ApiResp = ApiOk | ApiFail;

// Slug-urile reale ale meniurilor vin din JSON; aici menținem doar string + "nu-sigur"
type MenuSlug = string;

type LodgingKind = "proprie" | "oferta";
type MusicKind = "am-eu" | "oferta";
type PhotoVideoKind = "am-eu" | "oferta";

interface MenusOption {
  slug: MenuSlug;
  title: string;
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, params: { sitekey: string }) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
      ready: (cb: () => void) => void;
    };
  }
}

// ==============================
// Utils
// ==============================
function todayYmdEuropeBucharest(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function normalizePhoneRO(input: string): string {
  const raw = input.replace(/\s+/g, "");
  if (raw.startsWith("+407")) return raw;
  if (raw.startsWith("00407")) return `+${raw.slice(2)}`;
  if (raw.startsWith("07")) return `+4${raw}`;
  return raw;
}

function emailLike(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function ddmmyyyyFromYmd(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

// ==============================
// Component
// ==============================
export default function OfferRequest() {
  // State
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form refs
  const formRef = useRef<HTMLFormElement | null>(null);
  const recaptchaBoxRef = useRef<HTMLDivElement | null>(null);
  const recaptchaIdRef = useRef<number | null>(null);
  const recaptchaScriptLoaded = useRef(false);

  // Controlled UI state
  const [lodging, setLodging] = useState<LodgingKind>("proprie");
  const [music, setMusic] = useState<MusicKind>("am-eu");
  const [photoVideo, setPhotoVideo] = useState<PhotoVideoKind>("am-eu");

  const minDate = useMemo(() => todayYmdEuropeBucharest(), []);

  // Tip eveniment + meniu dinamic
  const defaultEventType: EventTypeSlug = EVENT_TYPES_SELECT[0]?.eventTypeSlug ?? "nunta";

  const [eventType, setEventType] = useState<EventTypeSlug>(defaultEventType);
  const [menuSlug, setMenuSlug] = useState<MenuSlug>("nu-sigur");

  const menuOptions: MenusOption[] = useMemo(() => {
    const menus = getMenusForEventType(eventType);
    const base: MenusOption = {
      slug: "nu-sigur",
      title: "Nu sunt sigur — consultă meniurile",
    };
    const derived: MenusOption[] = menus.map((m) => ({
      slug: m.slug,
      title: m.title,
    }));
    return [base, ...derived];
  }, [eventType]);

  const menuHintHref = useMemo(() => withBase(getEventTypeAnchorHref(eventType)), [eventType]);

  // Load + render reCAPTCHA v2 ca widget separat, robust la race-condition cu alt formular
  useEffect(() => {
    if (recaptchaScriptLoaded.current) return;

    const siteKey = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "").trim();
    if (!siteKey) {
      recaptchaScriptLoaded.current = true;
      return;
    }

    const renderWidget = () => {
      if (!recaptchaBoxRef.current) return;
      if (recaptchaIdRef.current !== null) return;
      if (!window.grecaptcha) return;
      try {
        const id = window.grecaptcha.render(recaptchaBoxRef.current, {
          sitekey: siteKey,
        });
        recaptchaIdRef.current = id;
      } catch {
        /* ignore */
      }
    };

    const readyOrRender = () => {
      if (!window.grecaptcha) return;
      try {
        window.grecaptcha.ready(() => renderWidget());
      } catch {
        /* ignore */
      }
    };

    // găsește (sau injectează) scriptul reCAPTCHA
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.google.com/recaptcha/api.js"]',
    );

    if (!existing) {
      const sc = document.createElement("script");
      // localizare în RO fără a schimba comportamentul
      sc.src = "https://www.google.com/recaptcha/api.js?hl=ro";
      sc.async = true;
      sc.defer = true;
      sc.onload = () => readyOrRender();
      document.head.appendChild(sc);
    } else {
      // Scriptul există deja — poate fi încă în încărcare sau deja gata
      if (typeof window.grecaptcha === "undefined") {
        // atașează onload pe scriptul existent
        existing.addEventListener("load", () => readyOrRender(), { once: true });
        // fallback: mic polling până apare window.grecaptcha (max ~5s)
        const started = Date.now();
        const poll = window.setInterval(() => {
          if (window.grecaptcha) {
            window.clearInterval(poll);
            readyOrRender();
          } else if (Date.now() - started > 5000) {
            window.clearInterval(poll);
          }
        }, 50);
      } else {
        readyOrRender();
      }
    }

    recaptchaScriptLoaded.current = true;
  }, []);

  // Submit
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const f = formRef.current;
    if (!f) return;

    const fd = new FormData(f);
    const name = String(fd.get("name") || "").trim();
    const address = String(fd.get("address") || "").trim();
    const eventDate = String(fd.get("eventDate") || "").trim();
    const participantsStr = String(fd.get("participants") || "").trim();
    const phone = normalizePhoneRO(String(fd.get("phone") || "").trim());
    const whatsapp = String(fd.get("whatsapp") || "") === "on";
    const email = String(fd.get("email") || "").trim();

    const eventTypeRaw = String(fd.get("eventType") || "").trim();
    const menu = String(fd.get("menu") || "nu-sigur").trim() as MenuSlug;

    const lodgingKind = (String(fd.get("lodging") || "proprie") as LodgingKind) || "proprie";
    const rooms = String(fd.get("rooms") || "").trim();
    const nights = String(fd.get("nights") || "").trim();
    const lodgingNotes = String(fd.get("lodgingNotes") || "").trim();

    const musicKind = (String(fd.get("music") || "am-eu") as MusicKind) || "am-eu";
    const musicPrefs = String(fd.get("musicPrefs") || "").trim();
    const musicGenre = String(fd.get("musicGenre") || "").trim();
    const musicInterval = String(fd.get("musicInterval") || "").trim();

    const photoVideoKind = (String(fd.get("photoVideo") || "am-eu") as PhotoVideoKind) || "am-eu";
    const pvPackage = String(fd.get("pvPackage") || "").trim();
    const pvDuration = String(fd.get("pvDuration") || "").trim();
    const pvDeliverables = String(fd.get("pvDeliverables") || "").trim();

    const details = String(fd.get("details") || "").trim();
    const gdpr = String(fd.get("gdpr") || "") === "on";

    const hpt = String(fd.get("_hpt") || "");
    const widgetId = recaptchaIdRef.current ?? undefined;
    const recaptchaToken = (window.grecaptcha?.getResponse(widgetId) || "").trim();

    // Client validations (server revalidează)
    if (!name || !address || !eventDate || !participantsStr || !phone || !email || !gdpr) {
      setError("Completează toate câmpurile obligatorii și acordă GDPR.");
      return;
    }
    if (!eventTypeRaw) {
      setError("Selectează tipul evenimentului.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      setError("Data evenimentului este invalidă.");
      return;
    }
    const participants = Number(participantsStr);
    if (!Number.isInteger(participants) || participants < 20 || participants > 250) {
      setError("Numărul de participanți trebuie să fie între 20 și 250.");
      return;
    }
    if (!emailLike(email)) {
      setError("Adresa de e-mail este invalidă.");
      return;
    }
    if (!recaptchaToken) {
      setError("Confirmă reCAPTCHA.");
      return;
    }

    const eventTypeValue = eventTypeRaw as EventTypeSlug;

    // Payload
    const payload = {
      name,
      address,
      eventDate, // YYYY-MM-DD (server convertește la dd.MM.yyyy)
      participants,
      phone,
      whatsapp,
      email,
      eventType: eventTypeValue,
      menu,
      lodging: {
        kind: lodgingKind,
        rooms: lodgingKind === "oferta" ? rooms : "",
        nights: lodgingKind === "oferta" ? nights : "",
        notes: lodgingKind === "oferta" ? lodgingNotes : "",
      },
      music: {
        kind: musicKind,
        prefs: musicKind === "oferta" ? musicPrefs : "",
        genre: musicKind === "oferta" ? musicGenre : "",
        interval: musicKind === "oferta" ? musicInterval : "",
      },
      photoVideo: {
        kind: photoVideoKind,
        package: photoVideoKind === "oferta" ? pvPackage : "",
        duration: photoVideoKind === "oferta" ? pvDuration : "",
        deliverables: photoVideoKind === "oferta" ? pvDeliverables : "",
      },
      details,
      recaptchaToken,
      _hpt: hpt,
    };

    // Call API
    setSending(true);
    try {
      const res = await fetch(withBase("/api/offer-request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as ApiResp;

      if (!res.ok || data.ok === false) {
        const msg = data.ok === false ? data.message : "A apărut o eroare la trimitere.";
        setError(msg);
        setSending(false);
        return;
      }

      setSuccess(true);
      setSending(false);
      f.reset();
      setLodging("proprie");
      setMusic("am-eu");
      setPhotoVideo("am-eu");
      setEventType(defaultEventType);
      setMenuSlug("nu-sigur");
      window.grecaptcha?.reset(recaptchaIdRef.current ?? undefined);

      window.setTimeout(() => setSuccess(false), 6000);
    } catch {
      setError("Nu am putut trimite solicitarea. Încearcă din nou.");
      setSending(false);
    }
  };

  // ==============================
  // Render
  // ==============================
  return (
    <div className={s.wrap} aria-labelledby="offer-form-title">
      <h2 id="offer-form-title" className={s.title}>
        Solicită ofertă
      </h2>

      <p className={s.lead}>
        Completează formularul, iar noi îți trimitem o propunere personalizată.{" "}
        <span className={s.hint}>
          Dacă nu ești sigur de meniu, vei putea consulta meniurile în funcție de tipul de eveniment
          ales.
        </span>
      </p>

      <form
        ref={formRef}
        className={s.form}
        onSubmit={onSubmit}
        noValidate
        aria-describedby="offer-gdpr"
      >
        {/* Identificare */}
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>Detalii solicitant</legend>

          <label className={s.label}>
            Nume și prenume <span className={s.req}>(obligatoriu)</span>
            <input
              className={s.input}
              name="name"
              type="text"
              required
              maxLength={80}
              placeholder="Ion Popescu"
              autoComplete="name"
            />
          </label>

          <label className={s.label}>
            Adresă <span className={s.req}>(obligatoriu)</span>
            <input
              className={s.input}
              name="address"
              type="text"
              required
              maxLength={120}
              placeholder="Str. Exemplu 10, Focșani"
              autoComplete="street-address"
            />
          </label>

          <label className={s.label}>
            Adresa e-mail <span className={s.req}>(obligatoriu)</span>
            <input
              className={s.input}
              name="email"
              type="email"
              required
              maxLength={160}
              placeholder="email@exemplu.com"
              autoComplete="email"
            />
          </label>

          <div className={s.inlineRow}>
            <label className={s.label}>
              Telefon <span className={s.req}>(obligatoriu)</span>
              <input
                className={s.input}
                name="phone"
                type="tel"
                required
                maxLength={20}
                placeholder="07xx xxx xxx"
                autoComplete="tel"
              />
            </label>

            <label className={s.checkboxLabel}>
              <input className={s.checkbox} type="checkbox" name="whatsapp" /> Numărul este pe
              WhatsApp
            </label>
          </div>
        </fieldset>

        {/* Eveniment */}
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>Detalii eveniment</legend>

          <div className={s.inlineRow}>
            <label className={s.label}>
              Data eveniment <span className={s.req}>(obligatoriu)</span>
              <input
                className={s.input}
                name="eventDate"
                type="date"
                required
                min={minDate}
                aria-describedby="offer-eventDate-hint"
              />
              <span id="offer-eventDate-hint" className={s.subtle}>
                Format: dd.MM.yyyy (se introduce în format YYYY-MM-DD)
              </span>
            </label>

            <label className={s.label}>
              Număr participanți <span className={s.req}>(obligatoriu)</span>
              <input
                className={s.input}
                name="participants"
                type="number"
                required
                inputMode="numeric"
                min={20}
                max={250}
                step={1}
                placeholder="ex. 120"
              />
            </label>
          </div>

          <label className={s.label}>
            Tip eveniment <span className={s.req}>(obligatoriu)</span>
            <select
              className={s.select}
              name="eventType"
              required
              value={eventType}
              onChange={(ev) => {
                const next = ev.target.value as EventTypeSlug;
                setEventType(next);
                setMenuSlug("nu-sigur");
              }}
            >
              {EVENT_TYPES_SELECT.map((opt) => (
                <option key={opt.eventTypeSlug} value={opt.eventTypeSlug}>
                  {opt.eventTypeLabel}
                </option>
              ))}
            </select>
          </label>

          <label className={s.label}>
            Meniu dorit
            <select
              className={s.select}
              name="menu"
              value={menuSlug}
              onChange={(ev) => setMenuSlug(ev.target.value as MenuSlug)}
              aria-describedby="offer-menu-hint"
            >
              {menuOptions.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.title}
                </option>
              ))}
            </select>
            <span id="offer-menu-hint" className={s.subtle}>
              Vezi detalii pentru meniuri în pagina de servicii:{" "}
              <a className={s.link} href={menuHintHref}>
                deschide secțiunea pentru tipul de eveniment selectat
              </a>
              .
            </span>
          </label>
        </fieldset>

        {/* Cazare */}
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>Cazare</legend>

          <div className={s.radioRow} role="radiogroup" aria-label="Cazare">
            <label className={s.radioLabel}>
              <input
                className={s.radio}
                type="radio"
                name="lodging"
                value="proprie"
                checked={lodging === "proprie"}
                onChange={() => setLodging("proprie")}
              />
              Cazare proprie
            </label>
            <label className={s.radioLabel}>
              <input
                className={s.radio}
                type="radio"
                name="lodging"
                value="oferta"
                checked={lodging === "oferta"}
                onChange={() => setLodging("oferta")}
              />
              Doresc ofertă
            </label>
          </div>

          {lodging === "oferta" && (
            <div className={s.inlineRow}>
              <label className={s.label}>
                Număr camere
                <input
                  className={s.input}
                  name="rooms"
                  type="number"
                  min={1}
                  max={200}
                  step={1}
                  placeholder="ex. 20"
                />
              </label>
              <label className={s.label}>
                Număr nopți
                <input
                  className={s.input}
                  name="nights"
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  placeholder="ex. 2"
                />
              </label>
              <label className={s.label}>
                Observații cazare (opțional)
                <input
                  className={s.input}
                  name="lodgingNotes"
                  type="text"
                  maxLength={200}
                  placeholder="Preferințe, condiții..."
                />
              </label>
            </div>
          )}
        </fieldset>

        {/* Muzică */}
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>Muzică</legend>

          <div className={s.radioRow} role="radiogroup" aria-label="Muzică">
            <label className={s.radioLabel}>
              <input
                className={s.radio}
                type="radio"
                name="music"
                value="am-eu"
                checked={music === "am-eu"}
                onChange={() => setMusic("am-eu")}
              />
              Am eu
            </label>
            <label className={s.radioLabel}>
              <input
                className={s.radio}
                type="radio"
                name="music"
                value="oferta"
                checked={music === "oferta"}
                onChange={() => setMusic("oferta")}
              />
              Doresc ofertă
            </label>
          </div>

          {music === "oferta" && (
            <div className={s.inlineRow}>
              <label className={s.label}>
                Preferințe (formație/DJ)
                <input
                  className={s.input}
                  name="musicPrefs"
                  type="text"
                  maxLength={120}
                  placeholder="Formație / DJ"
                />
              </label>
              <label className={s.label}>
                Gen preferat
                <input
                  className={s.input}
                  name="musicGenre"
                  type="text"
                  maxLength={80}
                  placeholder="Ex. pop-rock, populară..."
                />
              </label>
              <label className={s.label}>
                Interval ore (opțional)
                <input
                  className={s.input}
                  name="musicInterval"
                  type="text"
                  maxLength={50}
                  placeholder="Ex. 18:00–02:00"
                />
              </label>
            </div>
          )}
        </fieldset>

        {/* Foto-video */}
        <fieldset className={s.fieldset}>
          <legend className={s.legend}>Foto-video</legend>

          <div className={s.radioRow} role="radiogroup" aria-label="Foto-video">
            <label className={s.radioLabel}>
              <input
                className={s.radio}
                type="radio"
                name="photoVideo"
                value="am-eu"
                checked={photoVideo === "am-eu"}
                onChange={() => setPhotoVideo("am-eu")}
              />
              Am eu
            </label>
            <label className={s.radioLabel}>
              <input
                className={s.radio}
                type="radio"
                name="photoVideo"
                value="oferta"
                checked={photoVideo === "oferta"}
                onChange={() => setPhotoVideo("oferta")}
              />
              Doresc ofertă
            </label>
          </div>

          {photoVideo === "oferta" && (
            <div className={s.inlineRow}>
              <label className={s.label}>
                Tip pachet
                <input
                  className={s.input}
                  name="pvPackage"
                  type="text"
                  maxLength={40}
                  placeholder="foto / foto+video"
                />
              </label>
              <label className={s.label}>
                Durata acoperire
                <input
                  className={s.input}
                  name="pvDuration"
                  type="text"
                  maxLength={40}
                  placeholder="Ex. 8 ore / toată ziua"
                />
              </label>
              <label className={s.label}>
                Livrabile dorite (opțional)
                <input
                  className={s.input}
                  name="pvDeliverables"
                  type="text"
                  maxLength={120}
                  placeholder="Ex. album, fișiere digitale..."
                />
              </label>
            </div>
          )}
        </fieldset>

        {/* Detalii suplimentare */}
        <label className={s.label}>
          Detalii suplimentare (opțional)
          <textarea
            className={s.textarea}
            name="details"
            rows={5}
            maxLength={1000}
            placeholder="Detalii relevante pentru ofertă…"
          />
        </label>

        {/* Honeypot */}
        <input
          type="text"
          name="_hpt"
          tabIndex={-1}
          autoComplete="off"
          className={s.honeypot}
          aria-hidden="true"
        />

        {/* reCAPTCHA v2 widget container — chiar deasupra butonului */}
        <div ref={recaptchaBoxRef} className={s.recaptchaBox} />

        {/* GDPR */}
        <div id="offer-gdpr" className={s.gdpr}>
          <label className={s.checkboxLabel}>
            <input className={s.checkbox} type="checkbox" name="gdpr" required /> Sunt de acord.{" "}
            <span className={s.subtle}>
              Folosim datele doar pentru a răspunde solicitării tale, conform{" "}
              <a className={s.link} href={withBase("/cookie-policy")}>
                politicii de confidențialitate
              </a>
              .
            </span>
          </label>
        </div>

        {/* Status */}
        <div className={s.status} aria-live="polite">
          {error && <span className={s.error}>{error}</span>}
        </div>

        {/* Submit */}
        <div className={s.submitRow}>
          <Button type="submit" disabled={sending} aria-busy={sending}>
            {sending ? "Se trimite…" : "Solicită ofertă"}
          </Button>
        </div>

        {/* Toast succes */}
        {success && (
          <div role="status" className={s.toast} aria-live="polite">
            Solicitarea a fost trimisă. Ți-am trimis un e-mail de confirmare.
          </div>
        )}
      </form>
    </div>
  );
}

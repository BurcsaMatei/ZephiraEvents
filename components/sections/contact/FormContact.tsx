// components/sections/contact/FormContact.tsx

"use client";

// ==============================
// Imports
// ==============================
import React, { useState } from "react";

import { withBase } from "../../../lib/config";
import * as s from "../../../styles/contact/FormContact.css";
import Appear from "../../animations/Appear";
import Button from "../../Button";
import AnimatedIcon from "../../ui/AnimatedIcon";

// ==============================
// Component
// ==============================
export default function FormContact() {
  const [sending, setSending] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={s.wrap} aria-labelledby="contact-form-title">
      {/* Col stânga – FORMULAR */}
      <Appear as="div" className={s.col}>
        <form className={s.formBox} onSubmit={onSubmit}>
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
              />
            </label>
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
                <a href="https://wa.me/40740123456" aria-label="Scrie pe WhatsApp">
                  +40 740 123 456
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

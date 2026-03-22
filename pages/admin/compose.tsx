// pages/admin/compose.tsx
// Formular email standalone — trimite un email nou, salvează în composed_emails.

import type { GetServerSideProps } from "next";
import type { ReactElement } from "react";
import { useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { verifyAdminSession } from "../../lib/admin/auth";
import * as s from "../../styles/admin/compose.css";

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminComposePage() {
  const [to, setTo] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/admin/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, toName, subject, emailBody }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };

      if (data.ok) {
        setSuccess(`Email trimis cu succes către ${to}.`);
        setTo("");
        setToName("");
        setSubject("");
        setEmailBody("");
      } else {
        setError(data.message ?? "Eroare la trimitere.");
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={s.pageTitle}>Compune email</h1>

      <div className={s.card}>
        {success && <div className={s.successMsg}>{success}</div>}
        {error && <div className={s.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={s.field}>
            <label htmlFor="cmp-to" className={s.label}>
              Destinatar (email) *
            </label>
            <input
              id="cmp-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={s.input}
              required
              disabled={loading}
              placeholder="client@example.com"
            />
          </div>

          <div className={s.field}>
            <label htmlFor="cmp-name" className={s.label}>
              Nume destinatar
            </label>
            <input
              id="cmp-name"
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              className={s.input}
              disabled={loading}
              placeholder="Ion Popescu (opțional)"
            />
          </div>

          <div className={s.field}>
            <label htmlFor="cmp-subject" className={s.label}>
              Subiect *
            </label>
            <input
              id="cmp-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={s.input}
              required
              disabled={loading}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="cmp-body" className={s.label}>
              Mesaj *
            </label>
            <textarea
              id="cmp-body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className={s.textarea}
              required
              disabled={loading}
              placeholder="Scrie mesajul tău..."
            />
          </div>

          <button
            type="submit"
            className={s.button}
            disabled={loading || !to.trim() || !subject.trim() || !emailBody.trim()}
          >
            {loading ? "Se trimite..." : "Trimite email"}
          </button>
        </form>
      </div>
    </>
  );
}

AdminComposePage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminComposePage;

// ──────────────────────────────────────────────────────────
// SSR — doar verificare sesiune
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Record<string, never>> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: {} };
};

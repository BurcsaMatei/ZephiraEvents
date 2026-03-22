// pages/admin/login.tsx
// Pagina de autentificare admin — fără Layout public (Header/Footer).

import { useRouter } from "next/router";
import type { ReactElement } from "react";
import { useState } from "react";

import * as s from "../../styles/admin/login.css";

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        await router.replace("/admin/inbox");
      } else {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? "Eroare la autentificare.");
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <h1 className={s.logo}>ZephiraEvents</h1>
        <p className={s.subtitle}>Dashboard admin</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className={s.errorBox} role="alert">
              {error}
            </div>
          )}

          <div className={s.field}>
            <label htmlFor="adm-email" className={s.label}>
              Email
            </label>
            <input
              id="adm-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={s.input}
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="adm-password" className={s.label}>
              Parolă
            </label>
            <input
              id="adm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={s.input}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className={s.button}>
            {loading ? "Se autentifică..." : "Intră în admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Bypasează Layout-ul public — pagina admin nu are Header/Footer
AdminLoginPage.getLayout = (page: ReactElement) => page;

export default AdminLoginPage;

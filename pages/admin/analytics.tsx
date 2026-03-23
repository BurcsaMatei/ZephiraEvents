// pages/admin/analytics.tsx
// Dashboard analytics GA4 — Realtime + raport 30 zile.

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import dynamic from "next/dynamic";
import { type ReactElement,useEffect, useRef, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import type { RealtimeData, ReportData } from "../../lib/admin/analytics";
import { getReportData } from "../../lib/admin/analytics";
import { verifyAdminSession } from "../../lib/admin/auth";
import * as s from "../../styles/admin/analytics.css";

// Recharts nu se poate randa server-side
const VisitorsChart = dynamic(
  () => import("../../components/admin/AnalyticsChart"),
  { ssr: false, loading: () => <div className={s.loadingText}>Se încarcă graficul…</div> },
);

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Props = {
  reportData: ReportData | null;
  reportError: string | null;
};

// ──────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────

interface StatBarProps {
  label: string;
  value: string;
  pct: number;
}

function StatBar({ label, value, pct }: StatBarProps) {
  return (
    <div className={s.statRow}>
      <div className={s.statRowTop}>
        <span className={s.statLabel}>{label}</span>
        <span className={s.statValue}>{value}</span>
      </div>
      <div className={s.statBarBg}>
        <div className={s.statBarFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────
function AdminAnalyticsPage({
  reportData,
  reportError,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);
  const [rtLoading, setRtLoading] = useState(true);
  const [rtError, setRtError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchRealtime() {
    setRtLoading(true);
    setRtError(null);
    try {
      const res = await fetch("/api/admin/analytics/realtime");
      const data = (await res.json()) as RealtimeData & { error?: string };
      if (!res.ok) {
        setRtError(data.error ?? "Eroare necunoscută");
      } else {
        setRealtime(data);
        setLastRefresh(new Date());
      }
    } catch {
      setRtError("Eroare de rețea");
    } finally {
      setRtLoading(false);
    }
  }

  useEffect(() => {
    void fetchRealtime();
    intervalRef.current = setInterval(() => void fetchRealtime(), 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatRefreshTime(d: Date): string {
    return d.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Analytics</h1>
        <span className={s.pageSub}>Ultimele 30 zile</span>
      </div>

      {/* ── Realtime ─────────────────────────────────────── */}
      <div className={s.realtimeGrid}>
        {/* Card vizitatori live */}
        <div className={s.card}>
          <p className={s.cardTitle}>Live acum</p>
          <div className={s.liveCountWrap}>
            <span className={s.liveCount}>
              {rtLoading && !realtime ? "—" : (realtime?.activeUsers ?? 0)}
            </span>
            <span className={s.liveLabel}>
              <span className={s.liveDot} />
              vizitatori activi
            </span>
          </div>
          <div className={s.refreshRow}>
            <button
              type="button"
              className={s.refreshBtn}
              onClick={() => void fetchRealtime()}
              disabled={rtLoading}
            >
              {rtLoading ? "Se actualizează…" : "Actualizează"}
            </button>
            {lastRefresh && (
              <span className={s.refreshTs}>
                {formatRefreshTime(lastRefresh)}
              </span>
            )}
          </div>
          {rtError && <p className={s.loadingText} style={{ color: "#dc2626" }}>{rtError}</p>}
        </div>

        {/* Card pagini live */}
        <div className={s.card}>
          <p className={s.cardTitle}>Pagini vizitate acum</p>
          {rtLoading && !realtime ? (
            <p className={s.liveEmpty}>Se încarcă…</p>
          ) : (realtime?.byPage ?? []).length === 0 ? (
            <p className={s.liveEmpty}>Niciun vizitator activ.</p>
          ) : (
            <div className={s.liveTable}>
              {(realtime?.byPage ?? []).map((item) => (
                <div key={item.page} className={s.liveRow}>
                  <span className={s.liveRowPage}>{item.page}</span>
                  <span className={s.liveRowUsers}>{item.users}</span>
                  {item.countries.length > 0 && (
                    <span className={s.liveRowCountries}>
                      {item.countries.slice(0, 3).join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Eroare raport ─────────────────────────────────── */}
      {reportError && (
        <div className={s.errorBox}>
          Eroare GA4: {reportError}
        </div>
      )}

      {/* ── Grafic 30 zile ───────────────────────────────── */}
      {reportData && (
        <div className={`${s.card} ${s.chartCard}`}>
          <p className={s.cardTitle}>Vizitatori zilnici — 30 zile</p>
          <VisitorsChart data={reportData.dailyVisitors} />
        </div>
      )}

      {/* ── Statistici grid ──────────────────────────────── */}
      {reportData && (
        <div className={s.statsGrid}>
          {/* Surse trafic */}
          <div className={s.card}>
            <p className={s.cardTitle}>Surse trafic</p>
            <div className={s.statList}>
              {reportData.trafficSources.map((src) => (
                <StatBar
                  key={src.channel}
                  label={src.channel}
                  value={`${src.sessions.toLocaleString("ro-RO")} · ${src.pct}%`}
                  pct={src.pct}
                />
              ))}
            </div>
          </div>

          {/* Device split */}
          <div className={s.card}>
            <p className={s.cardTitle}>Device</p>
            <div className={s.statList}>
              {reportData.deviceCategories.map((dev) => (
                <StatBar
                  key={dev.device}
                  label={dev.device}
                  value={`${dev.sessions.toLocaleString("ro-RO")} · ${dev.pct}%`}
                  pct={dev.pct}
                />
              ))}
            </div>
          </div>

          {/* Top țări */}
          <div className={s.card}>
            <p className={s.cardTitle}>Top 10 țări</p>
            <div className={s.statList}>
              {reportData.topCountries.map((c) => (
                <StatBar
                  key={c.country}
                  label={c.country}
                  value={`${c.sessions.toLocaleString("ro-RO")} · ${c.pct}%`}
                  pct={c.pct}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

AdminAnalyticsPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminAnalyticsPage;

// ──────────────────────────────────────────────────────────
// SSR
// ──────────────────────────────────────────────────────────
export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  if (!verifyAdminSession(req)) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  let reportData: ReportData | null = null;
  let reportError: string | null = null;

  try {
    reportData = await getReportData();
  } catch (err) {
    reportError = err instanceof Error ? err.message : "Eroare necunoscută";
  }

  return { props: { reportData, reportError } };
};

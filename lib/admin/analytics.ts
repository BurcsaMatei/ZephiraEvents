// lib/admin/analytics.ts
// GA4 Data API — Realtime + Report 30 zile.
// Folosit exclusiv server-side (API routes, getServerSideProps).

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from "fs";
import path from "path";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface RealtimeData {
  activeUsers: number;
  byPage: Array<{ page: string; users: number; countries: string[] }>;
}

export interface DailyVisitor {
  date: string; // "DD/MM" — pentru afișare în grafic
  users: number;
}

export interface TrafficSource {
  channel: string;
  sessions: number;
  pct: number;
}

export interface DeviceStat {
  device: string;
  sessions: number;
  pct: number;
}

export interface CountryStat {
  country: string;
  sessions: number;
  pct: number;
}

export interface ReportData {
  dailyVisitors: DailyVisitor[];
  trafficSources: TrafficSource[];
  deviceCategories: DeviceStat[];
  topCountries: CountryStat[];
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function calcPct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

function formatGa4Date(d: string): string {
  // GA4 format: "20240101" → "01/01"
  if (d.length !== 8) return d;
  return `${d.slice(6, 8)}/${d.slice(4, 6)}`;
}

function safeNum(v: string | null | undefined): number {
  return Number(v ?? 0);
}

const DEVICE_LABEL: Record<string, string> = {
  mobile: "Mobil",
  desktop: "Desktop",
  tablet: "Tabletă",
};

// ──────────────────────────────────────────────────────────
// Client factory
// ──────────────────────────────────────────────────────────

function loadServiceAccountKey(): { client_email: string; private_key: string } {
  // 1. Env var JSON (Vercel, CI) — prioritate
  const keyJson = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON ?? "").trim();
  if (keyJson) {
    return JSON.parse(keyJson) as { client_email: string; private_key: string };
  }

  // 2. Fișier local (dev) — fallback
  const keyPath = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ?? "").trim();
  if (keyPath) {
    const absPath = path.resolve(process.cwd(), keyPath);
    return JSON.parse(fs.readFileSync(absPath, "utf8")) as {
      client_email: string;
      private_key: string;
    };
  }

  throw new Error(
    "GA4: lipsesc GOOGLE_SERVICE_ACCOUNT_KEY_JSON (Vercel) sau GOOGLE_SERVICE_ACCOUNT_KEY_PATH (local).",
  );
}

function createClient(): BetaAnalyticsDataClient {
  const key = loadServiceAccountKey();

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
  });
}

function getProperty(): string {
  const id = (process.env.GA4_PROPERTY_ID ?? "").trim();
  if (!id) throw new Error("GA4_PROPERTY_ID lipsă");
  return `properties/${id}`;
}

// ──────────────────────────────────────────────────────────
// Realtime
// ──────────────────────────────────────────────────────────

export async function getRealtimeData(): Promise<RealtimeData> {
  const client = createClient();
  const property = getProperty();

  const [response] = await client.runRealtimeReport({
    property,
    dimensions: [{ name: "unifiedScreenName" }, { name: "country" }],
    metrics: [{ name: "activeUsers" }],
  });

  const rows = response.rows ?? [];

  // Agregare pe pagină — colectăm țările pentru fiecare pagină
  const pageMap = new Map<string, { users: number; countries: Set<string> }>();

  for (const row of rows) {
    const page = row.dimensionValues?.[0]?.value ?? "(unknown)";
    const country = row.dimensionValues?.[1]?.value ?? "";
    const users = safeNum(row.metricValues?.[0]?.value);

    const existing = pageMap.get(page);
    if (existing) {
      existing.users += users;
      if (country) existing.countries.add(country);
    } else {
      pageMap.set(page, { users, countries: new Set(country ? [country] : []) });
    }
  }

  const activeUsers = Array.from(pageMap.values()).reduce(
    (sum, e) => sum + e.users,
    0,
  );

  const byPage = Array.from(pageMap.entries())
    .sort((a, b) => b[1].users - a[1].users)
    .slice(0, 10)
    .map(([page, { users, countries }]) => ({
      page,
      users,
      countries: Array.from(countries),
    }));

  return { activeUsers, byPage };
}

// ──────────────────────────────────────────────────────────
// Report 30 zile
// ──────────────────────────────────────────────────────────

export async function getReportData(): Promise<ReportData> {
  const client = createClient();
  const property = getProperty();
  const dateRange = { startDate: "30daysAgo", endDate: "today" };

  const [
    [dailyRes],
    [sourcesRes],
    [devicesRes],
    [countriesRes],
  ] = await Promise.all([
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [
        {
          dimension: { orderType: "ALPHANUMERIC", dimensionName: "date" },
        },
      ],
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
  ]);

  // Vizitatori pe zile
  const dailyVisitors: DailyVisitor[] = (dailyRes.rows ?? []).map((row) => ({
    date: formatGa4Date(row.dimensionValues?.[0]?.value ?? ""),
    users: safeNum(row.metricValues?.[0]?.value),
  }));

  // Surse trafic
  const sourceRows = sourcesRes.rows ?? [];
  const sourceTotal = sourceRows.reduce(
    (s, r) => s + safeNum(r.metricValues?.[0]?.value),
    0,
  );
  const trafficSources: TrafficSource[] = sourceRows.map((row) => {
    const sessions = safeNum(row.metricValues?.[0]?.value);
    return {
      channel: row.dimensionValues?.[0]?.value ?? "(necunoscut)",
      sessions,
      pct: calcPct(sessions, sourceTotal),
    };
  });

  // Device categories
  const deviceRows = devicesRes.rows ?? [];
  const deviceTotal = deviceRows.reduce(
    (s, r) => s + safeNum(r.metricValues?.[0]?.value),
    0,
  );
  const deviceCategories: DeviceStat[] = deviceRows.map((row) => {
    const raw = (row.dimensionValues?.[0]?.value ?? "").toLowerCase();
    const sessions = safeNum(row.metricValues?.[0]?.value);
    return {
      device: DEVICE_LABEL[raw] ?? raw,
      sessions,
      pct: calcPct(sessions, deviceTotal),
    };
  });

  // Top țări
  const countryRows = countriesRes.rows ?? [];
  const countryTotal = countryRows.reduce(
    (s, r) => s + safeNum(r.metricValues?.[0]?.value),
    0,
  );
  const topCountries: CountryStat[] = countryRows.map((row) => {
    const sessions = safeNum(row.metricValues?.[0]?.value);
    return {
      country: row.dimensionValues?.[0]?.value ?? "(necunoscut)",
      sessions,
      pct: calcPct(sessions, countryTotal),
    };
  });

  return { dailyVisitors, trafficSources, deviceCategories, topCountries };
}

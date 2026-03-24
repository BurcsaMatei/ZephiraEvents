// components/admin/AnalyticsChart.tsx
// Grafic vizitatori 30 zile — Recharts AreaChart.
// Importat dinamic (ssr: false) din pages/admin/analytics.tsx.

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyVisitor } from "../../lib/admin/analytics";
import * as s from "../../styles/admin/analytics.css";

interface Props {
  data: DailyVisitor[];
}

export default function AnalyticsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className={s.emptyChart}>
        Nu există date pentru această perioadă.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5561F2" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#5561F2" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#bbb" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#bbb" }}
          axisLine={false}
          tickLine={false}
          width={30}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: "12px",
            borderRadius: "8px",
            border: "1px solid #e8e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ fontWeight: 600, color: "#1a1a2e" }}
          itemStyle={{ color: "#5561F2" }}
        />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#5561F2"
          strokeWidth={2}
          fill="url(#gradVisitors)"
          dot={false}
          name="Vizitatori"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

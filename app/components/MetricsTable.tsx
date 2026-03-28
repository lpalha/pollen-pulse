"use client";

import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { SECTIONS, MetricConfig } from "@/app/config/dashboard";

export type Granularity = "day" | "week" | "month";

/* ─── Types ──────────────────────────────────────────────────────── */
interface DataPoint {
  period_start: string;
  value: number;
}

interface MetricState {
  points: DataPoint[];
  loading: boolean;
  error: string | null;
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function getCurrentPeriodStart(granularity: Granularity): Date {
  const now = new Date();
  if (granularity === "day") {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  } else if (granularity === "week") {
    const day = now.getUTCDay(); // 0 = Sun
    const diff = day === 0 ? -6 : 1 - day; // shift to Monday
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() + diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  } else {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
}

function transformRaw(
  raw: { data: { cols: { name: string }[]; rows: (string | number | null)[][] } },
  valueKey: string
): DataPoint[] {
  const { cols, rows } = raw.data;
  const pIdx = cols.findIndex((c) => c.name === "period_start");
  const vIdx = cols.findIndex((c) => c.name === valueKey);
  if (pIdx === -1 || vIdx === -1) return [];
  return rows
    .map((row) => ({
      period_start: row[pIdx] as string,
      value: Number(row[vIdx]) ?? 0,
    }))
    .sort(
      (a, b) =>
        new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
    );
}

function fmt(value: number, decimals: number): string {
  if (decimals === 0) return Math.round(value).toLocaleString("en-GB");
  return value.toFixed(decimals);
}

function fmtPeriodLabel(date: Date, granularity: Granularity): string {
  if (granularity === "day" || granularity === "week") {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  } else {
    return date.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }
}

function fmtPtdLabel(now: Date, granularity: Granularity): string {
  const start = getCurrentPeriodStart(granularity);
  const s = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${s} → now`;
}

function fmtLastPeriodHeader(granularity: Granularity, lastPeriodStart: Date | null): string {
  if (!lastPeriodStart) return "—";
  if (granularity === "day") {
    return lastPeriodStart.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  } else if (granularity === "week") {
    return (
      "Week of " +
      lastPeriodStart.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      })
    );
  } else {
    return lastPeriodStart.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }
}

const GRANULARITY_LABELS: Record<Granularity, { last: string; ptd: string; plural: string }> = {
  day: { last: "Yesterday", ptd: "Today so far", plural: "days" },
  week: { last: "Last completed week", ptd: "Week to date", plural: "weeks" },
  month: { last: "Last completed month", ptd: "Month to date", plural: "months" },
};

/* ─── Sparkline subcomponent ─────────────────────────────────────── */
function Sparkline({ points, color = "#AACC00" }: { points: DataPoint[]; color?: string }) {
  if (points.length === 0)
    return <span className="text-xs" style={{ color: "rgba(7,41,14,0.3)" }}>—</span>;

  const data = points.map((p) => ({ v: p.value }));

  return (
    <ResponsiveContainer width="100%" height={52}>
      <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.8}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid rgba(7,41,14,0.12)",
            borderRadius: 6,
            fontSize: 11,
            padding: "4px 8px",
            color: "#07290E",
          }}
          itemStyle={{ color: "#07290E", fontWeight: 600 }}
          formatter={(v: number) => [v.toLocaleString("en-GB"), ""]}
          labelFormatter={() => ""}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─── Single metric row ──────────────────────────────────────────── */
function MetricRow({
  metric,
  state,
  granularity,
  periodCount,
}: {
  metric: MetricConfig;
  state: MetricState;
  granularity: Granularity;
  periodCount: number;
}) {
  const currentStart = getCurrentPeriodStart(granularity);

  const completed = state.points.filter(
    (p) => new Date(p.period_start).getTime() < currentStart.getTime()
  );
  const current = state.points.find(
    (p) => new Date(p.period_start).getTime() >= currentStart.getTime()
  );
  const sparkPoints = completed.slice(-periodCount);
  const lastPt = completed[completed.length - 1];
  const prevPt = completed[completed.length - 2];

  const pctChange =
    lastPt && prevPt && prevPt.value !== 0
      ? ((lastPt.value - prevPt.value) / prevPt.value) * 100
      : null;

  const cellBase = "px-4 py-4 text-sm align-middle";

  return (
    <tr
      className="border-b transition-colors"
      style={{ borderColor: "rgba(7,41,14,0.06)" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(7,41,14,0.02)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      {/* Metric label */}
      <td className={`${cellBase} font-medium pl-5`} style={{ color: "#07290E" }}>
        {metric.label}
      </td>

      {/* Unit */}
      <td className={cellBase} style={{ color: "rgba(7,41,14,0.5)" }}>
        {metric.unit}
      </td>

      {/* Calculation */}
      <td
        className={cellBase}
        style={{ color: "rgba(7,41,14,0.5)", maxWidth: 220 }}
      >
        {metric.calculation}
      </td>

      {/* Last completed period */}
      <td
        className={`${cellBase} text-center`}
        style={{ borderLeft: "1px solid rgba(7,41,14,0.06)" }}
      >
        {state.loading ? (
          <div
            className="h-4 rounded animate-pulse mx-auto"
            style={{ width: 48, background: "rgba(7,41,14,0.08)" }}
          />
        ) : state.error ? (
          <span className="text-xs text-red-400">err</span>
        ) : lastPt ? (
          <div>
            <div className="text-lg font-bold" style={{ color: "#07290E" }}>
              {fmt(lastPt.value, metric.decimals)}
            </div>
            {pctChange !== null && (
              <div
                className="text-xs font-medium mt-0.5"
                style={{ color: pctChange >= 0 ? "#16a34a" : "#dc2626" }}
              >
                {pctChange >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(pctChange).toFixed(0)}%
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: "rgba(7,41,14,0.25)" }}>—</span>
        )}
      </td>

      {/* Period-to-date */}
      <td
        className={`${cellBase} text-center`}
        style={{ borderLeft: "1px solid rgba(7,41,14,0.06)" }}
      >
        {state.loading ? (
          <div
            className="h-4 rounded animate-pulse mx-auto"
            style={{ width: 40, background: "rgba(7,41,14,0.08)" }}
          />
        ) : current ? (
          <div>
            <div className="text-lg font-bold" style={{ color: "#07290E" }}>
              {fmt(current.value, metric.decimals)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(7,41,14,0.35)" }}>
              partial
            </div>
          </div>
        ) : (
          <span style={{ color: "rgba(7,41,14,0.25)" }}>—</span>
        )}
      </td>

      {/* Sparkline */}
      <td
        className={`px-4 py-2 align-middle`}
        style={{ borderLeft: "1px solid rgba(7,41,14,0.06)", minWidth: 220 }}
      >
        {state.loading ? (
          <div
            className="h-8 rounded animate-pulse"
            style={{ background: "rgba(7,41,14,0.06)" }}
          />
        ) : (
          <Sparkline points={sparkPoints} />
        )}
      </td>
    </tr>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function MetricsTable({ granularity }: { granularity: Granularity }) {
  const SPARK_COUNT = 6;

  // Flatten all metrics from all sections for data fetching
  const allMetrics = useMemo(
    () => SECTIONS.flatMap((s) => s.metrics),
    []
  );

  const [metricStates, setMetricStates] = useState<Record<string, MetricState>>(
    Object.fromEntries(
      allMetrics.map((m) => [m.id, { points: [], loading: true, error: null }])
    )
  );

  useEffect(() => {
    // Reset to loading when granularity changes
    setMetricStates(
      Object.fromEntries(
        allMetrics.map((m) => [m.id, { points: [], loading: true, error: null }])
      )
    );

    allMetrics.forEach((metric) => {
      fetch(`/api/metabase/${metric.cardId}?granularity=${granularity}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((raw) => {
          const points = transformRaw(raw, metric.valueKey);
          setMetricStates((prev) => ({
            ...prev,
            [metric.id]: { points, loading: false, error: null },
          }));
        })
        .catch((err: Error) => {
          setMetricStates((prev) => ({
            ...prev,
            [metric.id]: { points: [], loading: false, error: err.message },
          }));
        });
    });
  }, [granularity, allMetrics]);

  // Derive period labels from the first metric in the first section
  const firstMetric = allMetrics[0];
  const currentStart = getCurrentPeriodStart(granularity);
  const firstState = metricStates[firstMetric?.id];
  const completedFirst = firstState?.points.filter(
    (p) => new Date(p.period_start).getTime() < currentStart.getTime()
  ) ?? [];
  const sparkPeriods = completedFirst.slice(-SPARK_COUNT);
  const lastPeriodStart =
    completedFirst.length > 0
      ? new Date(completedFirst[completedFirst.length - 1].period_start)
      : null;

  const now = new Date();
  const labels = GRANULARITY_LABELS[granularity];

  // Build card ID list for footer
  const cardIds = SECTIONS.map(
    (s) => `#${s.metrics.map((m) => m.cardId).join(", #")} (${s.label})`
  ).join(" · ");

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid rgba(7,41,14,0.1)",
        boxShadow: "0 1px 4px rgba(7,41,14,0.04)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {/* ── Column headers ── */}
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(7,41,14,0.08)",
                background: "rgba(7,41,14,0.02)",
              }}
            >
              <th
                className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "rgba(7,41,14,0.4)", minWidth: 180 }}
              />
              <th
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "rgba(7,41,14,0.4)", minWidth: 120 }}
              >
                Unit
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide"
                style={{ color: "rgba(7,41,14,0.4)", minWidth: 200 }}
              >
                Calculation
              </th>

              {/* Last completed period */}
              <th
                className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide"
                style={{
                  color: "rgba(7,41,14,0.5)",
                  borderLeft: "1px solid rgba(7,41,14,0.06)",
                  minWidth: 140,
                }}
              >
                <div>{labels.last}</div>
                <div
                  className="text-xs font-normal normal-case mt-0.5"
                  style={{ color: "rgba(7,41,14,0.35)", letterSpacing: 0 }}
                >
                  {fmtLastPeriodHeader(granularity, lastPeriodStart)}
                </div>
              </th>

              {/* Period to date */}
              <th
                className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide"
                style={{
                  color: "rgba(7,41,14,0.5)",
                  borderLeft: "1px solid rgba(7,41,14,0.06)",
                  minWidth: 130,
                }}
              >
                <div>{labels.ptd}</div>
                <div
                  className="text-xs font-normal normal-case mt-0.5"
                  style={{ color: "rgba(7,41,14,0.35)", letterSpacing: 0 }}
                >
                  {fmtPtdLabel(now, granularity)}
                </div>
              </th>

              {/* Sparkline column */}
              <th
                className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide"
                style={{
                  color: "rgba(7,41,14,0.5)",
                  borderLeft: "1px solid rgba(7,41,14,0.06)",
                  minWidth: 280,
                }}
              >
                <div>
                  Last {sparkPeriods.length || SPARK_COUNT} {labels.plural}
                </div>
                {sparkPeriods.length > 0 && (
                  <div
                    className="flex justify-around mt-0.5 px-1"
                    style={{ color: "rgba(7,41,14,0.35)", letterSpacing: 0 }}
                  >
                    {sparkPeriods.map((p) => (
                      <span key={p.period_start} className="text-[10px] font-normal">
                        {fmtPeriodLabel(new Date(p.period_start), granularity)}
                      </span>
                    ))}
                  </div>
                )}
              </th>
            </tr>
          </thead>

          <tbody>
            {SECTIONS.map((section) => (
              <>
                {/* Section header */}
                <tr key={`header-${section.id}`} style={{ background: "#374151" }}>
                  <td
                    colSpan={6}
                    className="px-5 py-2.5 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "#fff" }}
                  >
                    ▼ {section.label}
                  </td>
                </tr>

                {/* Metric rows */}
                {section.metrics.map((metric) => (
                  <MetricRow
                    key={metric.id}
                    metric={metric}
                    state={metricStates[metric.id]}
                    granularity={granularity}
                    periodCount={SPARK_COUNT}
                  />
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 text-xs"
        style={{
          borderTop: "1px solid rgba(7,41,14,0.06)",
          background: "rgba(7,41,14,0.015)",
          color: "rgba(7,41,14,0.35)",
        }}
      >
        All times UTC · {granularity === "day" ? "Daily view" : granularity === "week" ? "Week starts Monday" : "Monthly view"} ·
        Source: Metabase cards {cardIds}
      </div>
    </div>
  );
}

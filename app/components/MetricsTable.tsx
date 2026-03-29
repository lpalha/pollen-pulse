"use client";

import React, { useEffect, useState, useMemo } from "react";
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

/** Compact format for sparkline labels: 1234 → "1.2k", 42 → "42" */
function fmtCompact(value: number, decimals: number): string {
  if (value >= 1000) return (value / 1000).toFixed(1) + "k";
  if (decimals === 0) return Math.round(value).toString();
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
  return `${s} \u2192 now`;
}

function fmtLastPeriodHeader(granularity: Granularity, lastPeriodStart: Date | null): string {
  if (!lastPeriodStart) return "\u2014";
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

/* ─── Info tooltip (CSS only) ────────────────────────────────────── */
function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center ml-1.5 group">
      <span
        className="inline-flex items-center justify-center rounded-full cursor-help"
        style={{
          width: 16,
          height: 16,
          fontSize: 10,
          fontWeight: 600,
          color: "rgba(7,41,14,0.35)",
          border: "1px solid rgba(7,41,14,0.15)",
        }}
      >
        i
      </span>
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-md text-xs font-normal whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50"
        style={{
          background: "#07290E",
          color: "#F5F1EA",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {text}
        {/* Arrow */}
        <span
          className="absolute top-full left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #07290E",
          }}
        />
      </span>
    </span>
  );
}

/* ─── Sparkline subcomponent ─────────────────────────────────────── */
function Sparkline({
  points,
  decimals,
  suffix,
  color = "#AACC00",
}: {
  points: DataPoint[];
  decimals: number;
  suffix?: string;
  color?: string;
}) {
  if (points.length === 0)
    return <span className="text-xs" style={{ color: "rgba(7,41,14,0.3)" }}>{"\u2014"}</span>;

  const data = points.map((p) => ({ v: p.value }));
  const sfx = suffix || "";

  return (
    <div>
      <ResponsiveContainer width="100%" height={56}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 12, bottom: 4 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.8}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }}
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
            formatter={(v: number) => [v.toLocaleString("en-GB") + sfx, ""]}
            labelFormatter={() => ""}
          />
        </LineChart>
      </ResponsiveContainer>
      {/* Value labels below chart */}
      <div
        className="flex justify-around px-3 -mt-1"
        style={{ color: "rgba(7,41,14,0.45)" }}
      >
        {points.map((p) => (
          <span key={p.period_start} className="text-[10px] font-medium tabular-nums">
            {fmtCompact(p.value, decimals)}{sfx}
          </span>
        ))}
      </div>
    </div>
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

  const sfx = metric.suffix || "";
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
      {/* Metric label + info icon */}
      <td className={`${cellBase} font-medium pl-5`} style={{ color: "#07290E" }}>
        <span className="inline-flex items-center">
          {metric.label}
          <InfoTooltip text={metric.calculation} />
        </span>
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
              {fmt(lastPt.value, metric.decimals)}{sfx}
            </div>
            {pctChange !== null && (
              <div
                className="text-xs font-medium mt-0.5"
                style={{ color: pctChange >= 0 ? "#16a34a" : "#dc2626" }}
              >
                {pctChange >= 0 ? "\u2191" : "\u2193"}{" "}
                {Math.abs(pctChange).toFixed(0)}%
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: "rgba(7,41,14,0.25)" }}>{"\u2014"}</span>
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
              {fmt(current.value, metric.decimals)}{sfx}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(7,41,14,0.35)" }}>
              partial
            </div>
          </div>
        ) : (
          <span style={{ color: "rgba(7,41,14,0.25)" }}>{"\u2014"}</span>
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
          <Sparkline points={sparkPoints} decimals={metric.decimals} suffix={metric.suffix} />
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

  // Collapsible sections — all expanded by default
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

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
  ).join(" \u00b7 ");

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
            {SECTIONS.map((section) => {
              const isCollapsed = collapsedSections.has(section.id);
              return (
                <React.Fragment key={section.id}>
                  {/* Section header — clickable to toggle */}
                  <tr
                    style={{ background: "#374151", cursor: "pointer" }}
                    onClick={() => toggleSection(section.id)}
                  >
                    <td
                      colSpan={4}
                      className="px-5 py-2.5 text-xs font-semibold tracking-wide uppercase select-none"
                      style={{ color: "#fff" }}
                    >
                      <span
                        className="inline-block transition-transform duration-200 mr-1"
                        style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
                      >
                        {"\u25BC"}
                      </span>
                      {section.label}
                    </td>
                  </tr>

                  {/* Metric rows — hidden when collapsed */}
                  {!isCollapsed &&
                    section.metrics.map((metric) => (
                      <MetricRow
                        key={metric.id}
                        metric={metric}
                        state={metricStates[metric.id]}
                        granularity={granularity}
                        periodCount={SPARK_COUNT}
                      />
                    ))}
                </React.Fragment>
              );
            })}
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
        All times UTC &middot; {granularity === "day" ? "Daily view" : granularity === "week" ? "Week starts Monday" : "Monthly view"} &middot;
        Source: Metabase cards {cardIds}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface ChartConfig {
  metabaseQuestionId: number;
  title: string;
  xKey: string;
  yKeys: string[];
  color?: string;
}

interface ChartRow {
  [key: string]: string | number | null;
}

function transformMetabaseData(raw: {
  data: {
    cols: { name: string }[];
    rows: (string | number | null)[][];
  };
}): ChartRow[] {
  const { cols, rows } = raw.data;
  return rows.map((row) => {
    const obj: ChartRow = {};
    cols.forEach((col, i) => {
      const val = row[i];
      if (typeof val === "string" && val.includes("T")) {
        const date = new Date(val);
        obj[col.name] = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
      } else {
        obj[col.name] = val;
      }
    });
    return obj;
  });
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5 text-sm">
      <p className="text-gray-500 mb-1 text-xs font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-semibold text-gray-900">
          {entry.name}:{" "}
          <span style={{ color: entry.color }}>
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function ChartCard({
  metabaseQuestionId,
  title,
  xKey,
  yKeys,
  color = "#AACC00",
}: ChartConfig) {
  const [data, setData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/metabase/${metabaseQuestionId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        setData(transformMetabaseData(raw));
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [metabaseQuestionId]);

  return (
    <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid rgba(7,41,14,0.1)", boxShadow: "0 1px 4px rgba(7,41,14,0.04)" }}>
      {/* Card header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-semibold" style={{ color: "#07290E" }}>{title}</p>
        </div>
        {!loading && !error && data.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: "#07290E" }}>
              {(data.reduce((sum, row) => sum + (Number(row[yKeys[0]]) || 0), 0)).toLocaleString()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(7,41,14,0.4)" }}>total completed swaps</p>
          </div>
        )}
      </div>

      {/* States */}
      {loading && (
        <div className="h-64 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(7,41,14,0.4)" }}>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading data...
          </div>
        </div>
      )}
      {error && (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              {yKeys.map((key, i) => (
                <linearGradient key={key} id={`grad-${metabaseQuestionId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(7,41,14,0.06)" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11, fill: "rgba(7,41,14,0.4)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "rgba(7,41,14,0.4)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              width={40}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
            {yKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${metabaseQuestionId}-${i})`}
                dot={false}
                activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text } from "@tremor/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
          year: "numeric",
        });
      } else {
        obj[col.name] = val;
      }
    });
    return obj;
  });
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
    <Card className="w-full">
      <Title>{title}</Title>
      {loading && (
        <Text className="mt-4 text-gray-400">Loading data...</Text>
      )}
      {error && (
        <Text className="mt-4 text-red-500">Error: {error}</Text>
      )}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={300} className="mt-6">
          <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              {yKeys.map((key, i) => (
                <linearGradient
                  key={key}
                  id={`grad-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 13, color: "#6b7280", paddingTop: 8 }}
            />
            {yKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${i})`}
                dot={false}
                activeDot={{ r: 5, fill: color }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

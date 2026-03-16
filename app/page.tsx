"use client";

import { useState } from "react";
import MetricsTable, { Granularity } from "./components/MetricsTable";

export default function DashboardPage() {
  const [granularity, setGranularity] = useState<Granularity>("week");

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Top header bar ── */}
      <header
        className="h-14 flex items-center justify-between px-8"
        style={{ borderBottom: "1px solid rgba(7,41,14,0.1)", background: "#F5F1EA" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#AACC00" }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="#07290E"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2v10m0 0l-3-3m3 3l3-3M3 17l3 2 3-2 3 2 3-2 3 2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: "#07290E" }}>
            Pulse
          </span>
        </div>

        {/* Weekly / Monthly toggle */}
        <div
          className="flex items-center rounded-lg p-0.5 gap-0.5"
          style={{ background: "rgba(7,41,14,0.08)" }}
        >
          {(["week", "month"] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={
                granularity === g
                  ? {
                      background: "#fff",
                      color: "#07290E",
                      boxShadow: "0 1px 3px rgba(7,41,14,0.12)",
                    }
                  : { color: "rgba(7,41,14,0.5)" }
              }
            >
              {g === "week" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page title */}
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "#07290E" }}>
              Overview
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(7,41,14,0.5)" }}>
              Pollen swap activity across all markets
            </p>
          </div>

          {/* Metrics table */}
          <MetricsTable granularity={granularity} />
        </div>
      </main>
    </div>
  );
}

import ChartCard from "./components/ChartCard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top header bar */}
      <header
        className="h-14 flex items-center justify-between px-8"
        style={{ borderBottom: "1px solid rgba(7,41,14,0.1)", background: "#F5F1EA" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#AACC00" }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="#07290E" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M12 2v10m0 0l-3-3m3 3l3-3M3 17l3 2 3-2 3 2 3-2 3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: "#07290E" }}>Pulse</span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium"
          style={{ background: "rgba(7,41,14,0.06)", color: "#07290E" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Weekly view
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Page title */}
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "#07290E" }}>Overview</h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(7,41,14,0.5)" }}>
              Pollen swap activity across all markets
            </p>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6">
            <ChartCard
              metabaseQuestionId={64}
              title="Swaps — Weekly Volume Trend"
              xKey="Week"
              yKeys={["Completed Swaps"]}
              color="#AACC00"
            />
          </div>

        </div>
      </main>
    </div>
  );
}

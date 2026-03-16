import ChartCard from "./components/ChartCard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top header bar */}
      <header className="h-14 flex items-center justify-between px-8 bg-white border-b border-gray-200">
        <h1 className="text-sm font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-xs text-gray-500 font-medium">Weekly view</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Page title */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
            <p className="text-sm text-gray-500 mt-0.5">Pollen swap activity across all markets</p>
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

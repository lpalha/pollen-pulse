import ChartCard from "./components/ChartCard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pulse</h1>
          <p className="text-gray-500 mt-1">Pollen operational dashboard</p>
        </div>

        {/* Charts grid */}
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
  );
}

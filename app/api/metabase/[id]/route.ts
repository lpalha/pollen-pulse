import { NextRequest, NextResponse } from "next/server";

const DB_ID = 2;

/**
 * SQL templates for each Metabase card.
 * {G} is replaced with the validated granularity ('week' or 'month').
 * Using /api/dataset with direct SQL avoids Metabase template-tag JDBC
 * parameter issues where DATE_TRUNC's string argument can't be a bound param.
 */
const CARD_SQL: Record<string, string> = {
  "66": `
    SELECT
      DATE_TRUNC('{G}', start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      COUNT(*) AS completed_swaps
    FROM swaps
    WHERE end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  "67": `
    SELECT
      DATE_TRUNC('{G}', s.start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT d.vehicle_id), 0), 2) AS swaps_per_vehicle
    FROM swaps s
    JOIN docks d ON s.dock_id = d.id
    WHERE s.end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  "68": `
    SELECT
      DATE_TRUNC('{G}', start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM slots), 0), 2) AS swaps_per_slot
    FROM swaps
    WHERE end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,

  "69": `
    SELECT
      DATE_TRUNC('{G}', s.start_time AT TIME ZONE 'Europe/Lisbon') AS period_start,
      ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT st.site_id), 0), 2) AS swaps_per_site
    FROM swaps s
    JOIN stations st ON s.station_id = st.id
    WHERE s.end_time IS NOT NULL
    GROUP BY 1
    ORDER BY 1 ASC`,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const base = process.env.METABASE_BASE_URL;
  const apiKey = process.env.METABASE_API_KEY;

  if (!base || !apiKey) {
    return NextResponse.json(
      { error: "Metabase credentials not configured" },
      { status: 500 }
    );
  }

  // Validate granularity strictly — only 'day', 'week', or 'month' allowed
  const rawGranularity = req.nextUrl.searchParams.get("granularity");
  const granularity =
    rawGranularity === "month" ? "month" : rawGranularity === "day" ? "day" : "week";

  const sqlTemplate = CARD_SQL[id];

  if (sqlTemplate) {
    // Use /api/dataset with direct SQL substitution to avoid JDBC param issues
    const query = sqlTemplate.replace(/\{G\}/g, granularity);

    const res = await fetch(`${base}/api/dataset`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        database: DB_ID,
        type: "native",
        native: { query },
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Metabase returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  }

  // Fallback: call card by ID directly (for other cards without SQL templates)
  const res = await fetch(`${base}/api/card/${id}/query`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Metabase returned ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

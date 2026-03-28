import { NextRequest, NextResponse } from "next/server";
import { CARD_SQL } from "@/app/config/queries";

const DB_ID = 2;

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

import { NextRequest, NextResponse } from "next/server";

const DB_ID = 2;

/**
 * Fetches a Metabase card's SQL, substitutes the granularity value,
 * and runs it via /api/dataset.
 *
 * The SQL lives in Metabase — we never hardcode it. If someone updates
 * the query in Metabase, the dashboard picks it up automatically.
 *
 * The only substitution we do is replacing {{granularity}} (Metabase
 * template-tag syntax) with the actual value ('day', 'week', 'month'),
 * because Metabase can't pass DATE_TRUNC's string argument as a bound
 * JDBC parameter.
 */
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

  // Validate granularity strictly
  const rawGranularity = req.nextUrl.searchParams.get("granularity");
  const granularity =
    rawGranularity === "month" ? "month" : rawGranularity === "day" ? "day" : "week";

  const headers = {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    // ── Step 1: Fetch the card definition to get the SQL ──────────
    const cardRes = await fetch(`${base}/api/card/${id}`, { headers });

    if (!cardRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch card ${id}: HTTP ${cardRes.status}` },
        { status: cardRes.status }
      );
    }

    const card = await cardRes.json();
    const datasetQuery = card.dataset_query;

    // Extract the native SQL — handle both Metabase query formats
    let nativeSQL: string | null = null;

    // Format 1 (newer): dataset_query.stages[0].native
    if (datasetQuery?.stages?.[0]?.native) {
      nativeSQL = datasetQuery.stages[0].native;
    }
    // Format 2 (older): dataset_query.native.query
    else if (datasetQuery?.native?.query) {
      nativeSQL = datasetQuery.native.query;
    }

    if (!nativeSQL) {
      return NextResponse.json(
        { error: `Card ${id} does not contain a native SQL query` },
        { status: 400 }
      );
    }

    // ── Step 2: Resolve model references ──────────────────────────
    // Metabase model references like {{#39-swaps-master-data}} are
    // replaced with the model's SQL as a subquery.
    let sql = nativeSQL;
    const modelRefPattern = /\{\{#(\d+)-[^}]+\}\}/g;
    const modelRefs = [...sql.matchAll(modelRefPattern)];

    for (const match of modelRefs) {
      const modelId = match[1];
      const modelRes = await fetch(`${base}/api/card/${modelId}`, { headers });
      if (!modelRes.ok) {
        return NextResponse.json(
          { error: `Failed to fetch model #${modelId}: HTTP ${modelRes.status}` },
          { status: modelRes.status }
        );
      }
      const modelCard = await modelRes.json();
      const modelQuery = modelCard.dataset_query;
      const modelSQL =
        modelQuery?.stages?.[0]?.native ||
        modelQuery?.native?.query;

      if (!modelSQL) {
        return NextResponse.json(
          { error: `Model #${modelId} does not contain native SQL` },
          { status: 400 }
        );
      }

      // Strip trailing semicolons — they break when inlined as a subquery
      const cleanModelSQL = modelSQL.replace(/;\s*$/, "");
      // Inline as a subquery, replacing the full {{#ID-name}} reference
      sql = sql.replace(match[0], `(${cleanModelSQL})`);
    }

    // ── Step 3: Substitute template tags ──────────────────────────
    // Replace {{granularity}} with the actual value.
    const query = sql.replace(
      /\{\{\s*granularity\s*\}\}/gi,
      granularity
    );

    // ── Step 4: Run the query via /api/dataset ────────────────────
    const res = await fetch(`${base}/api/dataset`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        database: DB_ID,
        type: "native",
        native: { query },
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Metabase query failed: HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

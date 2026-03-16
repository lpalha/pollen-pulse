import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
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

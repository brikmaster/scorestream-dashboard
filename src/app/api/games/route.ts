import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://scorestream.com/api/";

async function rpcCall(method: string, params: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });
  return res.json();
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.SCORESTREAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const gameIds = searchParams.get("gameIds");

  if (gameIds) {
    const data = await rpcCall("games.scores.search", {
      apiKey,
      gameIds: JSON.parse(gameIds),
      includeGameScoreSupplements: true,
      includeUserSupplements: true,
      count: parseInt(searchParams.get("count") || "30"),
      offset: parseInt(searchParams.get("offset") || "0"),
    });
    return NextResponse.json(data);
  }

  const data = await rpcCall("games.search", {
    apiKey,
    organizationIds: [1000],
    state: searchParams.get("state") || "OH",
    afterDateTime: searchParams.get("afterDateTime") || "",
    beforeDateTime: searchParams.get("beforeDateTime") || "",
    sportNames: JSON.parse(searchParams.get("sportNames") || '["basketball"]'),
    squadIds: JSON.parse(searchParams.get("squadIds") || "[1010]"),
    count: parseInt(searchParams.get("count") || "30"),
    offset: parseInt(searchParams.get("offset") || "0"),
    orderBy: "DESC",
  });
  return NextResponse.json(data);
}

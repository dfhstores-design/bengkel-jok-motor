import { NextRequest, NextResponse } from "next/server";

const apiUrl = () => process.env.APPS_SCRIPT_API_URL;

function fail(message: string, status = 500) {
  return NextResponse.json({ success: false, data: null, message }, { status });
}

async function forward(url: URL, init?: RequestInit) {
  try {
    const response = await fetch(url, { ...init, cache: "no-store" });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
  } catch {
    return fail("Tidak dapat terhubung ke backend Apps Script.");
  }
}

export async function GET() {
  const base = apiUrl();
  if (!base) return fail("APPS_SCRIPT_API_URL belum dikonfigurasi.");
  const url = new URL(base);
  url.searchParams.set("action", "listActiveJobs");
  return forward(url);
}

export async function POST(request: NextRequest) {
  const base = apiUrl();
  if (!base) return fail("APPS_SCRIPT_API_URL belum dikonfigurasi.");
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Permintaan tidak valid.", 400);
  }
  const url = new URL(base);
  url.searchParams.set("action", "createJob");
  return forward(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

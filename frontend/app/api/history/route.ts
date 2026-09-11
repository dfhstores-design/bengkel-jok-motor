import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const base = process.env.APPS_SCRIPT_API_URL;
  if (!base) return NextResponse.json({ success: false, data: null, message: "APPS_SCRIPT_API_URL belum dikonfigurasi." }, { status: 500 });
  const url = new URL(base); url.searchParams.set("action", "listClosedJobs");
  for (const key of ["query", "date_from", "date_to"]) { const value = request.nextUrl.searchParams.get(key); if (value) url.searchParams.set(key, value); }
  try { const response = await fetch(url, { cache: "no-store" }); return NextResponse.json(await response.json(), { status: response.ok ? 200 : response.status }); }
  catch { return NextResponse.json({ success: false, data: null, message: "Tidak dapat terhubung ke backend Apps Script." }, { status: 500 }); }
}

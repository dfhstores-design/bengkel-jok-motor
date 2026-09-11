import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const base = process.env.APPS_SCRIPT_API_URL;
  if (!base) return NextResponse.json({ success: false, data: null, message: "APPS_SCRIPT_API_URL belum dikonfigurasi." }, { status: 500 });
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ success: false, data: null, message: "Permintaan tidak valid." }, { status: 400 }); }
  const url = new URL(base); url.searchParams.set("action", "closeJob");
  try { const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" }); return NextResponse.json(await response.json(), { status: response.ok ? 200 : response.status }); }
  catch { return NextResponse.json({ success: false, data: null, message: "Pembayaran gagal terhubung ke backend." }, { status: 500 }); }
}

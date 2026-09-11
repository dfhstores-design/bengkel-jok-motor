import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.APPS_SCRIPT_API_URL;
  if (!base) return NextResponse.json({ success: false, data: null, message: "APPS_SCRIPT_API_URL belum dikonfigurasi." }, { status: 500 });
  const url = new URL(base); url.searchParams.set("action", "listLoginUsers");
  try { const response = await fetch(url, { cache: "no-store" }); return NextResponse.json(await response.json(), { status: response.ok ? 200 : response.status }); }
  catch { return NextResponse.json({ success: false, data: null, message: "Daftar pengguna gagal dimuat." }, { status: 500 }); }
}

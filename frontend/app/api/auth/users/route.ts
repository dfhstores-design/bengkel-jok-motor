import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.APPS_SCRIPT_API_URL;
  if (!base) return NextResponse.json({ success: false, data: null, message: "APPS_SCRIPT_API_URL belum dikonfigurasi." }, { status: 500 });
  const url = new URL(base); url.searchParams.set("action", "listLoginUsers");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      const payload = await response.json();
      return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
    } catch {
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }
  return NextResponse.json({ success: false, data: null, message: "Daftar pengguna gagal dimuat." }, { status: 500 });
}

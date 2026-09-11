import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, fail } from "@/lib/backend";

export async function POST(request: NextRequest) {
  const base = process.env.APPS_SCRIPT_API_URL;
  if (!base) return fail("APPS_SCRIPT_API_URL belum dikonfigurasi.");
  let body: unknown;
  try { body = await request.json(); } catch { return fail("Permintaan login tidak valid.", 400); }
  const url = new URL(base); url.searchParams.set("action", "login");
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
    const payload = await response.json();
    const result = NextResponse.json(payload, { status: response.ok ? 200 : response.status });
    if (payload?.success && payload?.data?.session_token) result.cookies.set(SESSION_COOKIE, payload.data.session_token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 6 * 60 * 60, path: "/" });
    return result;
  } catch { return fail("Login gagal terhubung ke backend."); }
}

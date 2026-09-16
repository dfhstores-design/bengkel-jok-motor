import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "motokraf_session";
type JsonRecord = Record<string, unknown>;

export function fail(message: string, status = 500) {
  return NextResponse.json({ success: false, data: null, message }, { status });
}

export async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value || "";
}

export async function backendUrl(action: string, params: Record<string, string> = {}) {
  const base = process.env.APPS_SCRIPT_API_URL;
  if (!base) return { error: fail("APPS_SCRIPT_API_URL belum dikonfigurasi.") } as const;
  const token = await sessionToken();
  if (!token) return { error: fail("Sesi login diperlukan.", 401) } as const;
  const url = new URL(base);
  url.searchParams.set("action", action);
  url.searchParams.set("session_token", token);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return { url, token } as const;
}

export async function forwardBackend(url: URL, init?: RequestInit) {
  const method = (init?.method || "GET").toUpperCase();
  let idempotentPost = false;
  if (method === "POST" && typeof init?.body === "string") {
    try {
      const body = JSON.parse(init.body);
      idempotentPost = typeof body?.idempotency_key === "string" && body.idempotency_key.length > 0;
    } catch {}
  }
  const attempts = method === "GET" || idempotentPost ? 2 : 1;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, cache: "no-store" });
      const text = await response.text();
      const payload = JSON.parse(text);
      if (response.status >= 500 && attempt + 1 < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
      }
      return NextResponse.json(payload, { status: response.ok ? 200 : response.status });
    } catch {
      if (attempt + 1 < attempts)
        await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }
  return fail("Tidak dapat terhubung ke backend Apps Script.");
}

export function bodyWithSession(body: unknown, token: string) {
  const value = body && typeof body === "object" && !Array.isArray(body) ? body as JsonRecord : {};
  return JSON.stringify({ ...value, session_token: token });
}

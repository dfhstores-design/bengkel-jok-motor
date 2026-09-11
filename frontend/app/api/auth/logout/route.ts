import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendUrl, bodyWithSession, forwardBackend } from "@/lib/backend";

export async function POST() {
  const result = await backendUrl("logout");
  if ("error" in result) {
    const response = NextResponse.json({ success: true, data: null, message: "Logout berhasil." });
    response.cookies.delete(SESSION_COOKIE); return response;
  }
  const response = await forwardBackend(result.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: bodyWithSession({}, result.token) });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

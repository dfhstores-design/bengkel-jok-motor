import { NextResponse } from "next/server";
import { SESSION_COOKIE, backendUrl, bodyWithSession, forwardBackend } from "@/lib/backend";

export async function POST() {
  const result = await backendUrl("logout");
  const response = NextResponse.json({ success: true, data: null, message: "Logout berhasil." });
  response.cookies.delete(SESSION_COOKIE);
  if ("error" in result) {
    return response;
  }
  // The cookie is cleared before this response leaves Vercel, so logout never waits on a cold Apps Script execution.
  void forwardBackend(result.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyWithSession({}, result.token),
  });
  return response;
}

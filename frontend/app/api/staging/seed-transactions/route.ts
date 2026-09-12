import { backendUrl, bodyWithSession, fail, forwardBackend } from "@/lib/backend";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") {
    return fail("Seed sintetis tidak tersedia pada production.", 403);
  }
  let body: { confirmation?: string };
  try {
    body = await request.json();
  } catch {
    return fail("Konfirmasi staging tidak valid.", 400);
  }
  if (body.confirmation !== "STAGING_ONLY_SYNTHETIC_350") {
    return fail("Konfirmasi staging diperlukan.", 400);
  }
  const result = await backendUrl("stagingSeedSyntheticTransactions350");
  if ("error" in result) return result.error;
  return forwardBackend(result.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyWithSession(body, result.token),
  });
}

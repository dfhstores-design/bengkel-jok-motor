import { NextRequest } from "next/server";
import { backendUrl, bodyWithSession, fail, forwardBackend } from "@/lib/backend";

export async function GET() { const result=await backendUrl("listActiveJobs"); if("error" in result)return result.error; return forwardBackend(result.url); }

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Permintaan tidak valid.", 400);
  }
  const result=await backendUrl("createJob"); if("error" in result)return result.error;
  return forwardBackend(result.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyWithSession(body,result.token),
  });
}

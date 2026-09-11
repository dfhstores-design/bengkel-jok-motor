import { NextRequest } from "next/server";
import { backendUrl, bodyWithSession, fail, forwardBackend } from "@/lib/backend";
export async function GET(request: NextRequest) {
  const params:Record<string,string>={}; for (const key of ["query","date_from","date_to"]) { const value=request.nextUrl.searchParams.get(key); if(value)params[key]=value; }
  const result=await backendUrl("listClosedJobs",params); if("error" in result)return result.error; return forwardBackend(result.url);
}

export async function POST(request: NextRequest) {
  let body: unknown; try { body = await request.json(); } catch { return fail("Permintaan edit tidak valid.", 400); }
  const result = await backendUrl("editClosedJob"); if ("error" in result) return result.error;
  return forwardBackend(result.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: bodyWithSession(body, result.token) });
}

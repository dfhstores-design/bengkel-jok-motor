import { NextRequest } from "next/server";
import { backendUrl, forwardBackend } from "@/lib/backend";
export async function GET(request: NextRequest) {
  const params:Record<string,string>={}; for (const key of ["query","date_from","date_to"]) { const value=request.nextUrl.searchParams.get(key); if(value)params[key]=value; }
  const result=await backendUrl("listClosedJobs",params); if("error" in result)return result.error; return forwardBackend(result.url);
}

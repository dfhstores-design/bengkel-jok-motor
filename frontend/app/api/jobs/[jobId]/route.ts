import { backendUrl, forwardBackend } from "@/lib/backend";

export async function GET(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const result=await backendUrl("getJob",{job_id:jobId}); if("error" in result)return result.error; return forwardBackend(result.url);
}

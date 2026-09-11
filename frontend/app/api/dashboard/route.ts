import { backendUrl, forwardBackend } from "@/lib/backend";
export async function GET(){const result=await backendUrl("getDashboard");if("error" in result)return result.error;return forwardBackend(result.url)}

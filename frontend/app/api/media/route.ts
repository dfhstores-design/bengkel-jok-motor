import { NextRequest, NextResponse } from "next/server"; import { backendUrl, bodyWithSession, forwardBackend } from "@/lib/backend";

const MAX_BYTES = 10 * 1024 * 1024;
const allowed = (type: string) => type.startsWith("image/") || ["video/mp4", "video/webm", "video/quicktime"].includes(type);

export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, data: null, message: "Permintaan upload tidak valid." }, { status: 400 }); }
  if (!body?.file_base64 || !body?.job_id || !body?.category || !body?.media_type) return NextResponse.json({ success: false, data: null, message: "File media wajib dipilih." }, { status: 400 });
  if (!allowed(String(body.mime_type || ""))) return NextResponse.json({ success: false, data: null, message: "Tipe file tidak didukung." }, { status: 400 });
  if (Number(body.file_size_bytes) > MAX_BYTES) return NextResponse.json({ success: false, data: null, message: "Ukuran file melebihi batas 10 MB." }, { status: 400 });
  const result=await backendUrl("addJobMedia"); if("error" in result)return result.error;
  return forwardBackend(result.url,{method:"POST",headers:{"Content-Type":"application/json"},body:bodyWithSession(body,result.token)});
}

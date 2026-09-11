import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 10 * 1024 * 1024;
const allowed = (type: string) => type.startsWith("image/") || ["video/mp4", "video/webm", "video/quicktime"].includes(type);

export async function POST(request: NextRequest) {
  const base = process.env.APPS_SCRIPT_API_URL;
  if (!base) return NextResponse.json({ success: false, data: null, message: "APPS_SCRIPT_API_URL belum dikonfigurasi." }, { status: 500 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, data: null, message: "Permintaan upload tidak valid." }, { status: 400 }); }
  if (!body?.file_base64 || !body?.job_id || !body?.category || !body?.media_type) return NextResponse.json({ success: false, data: null, message: "File media wajib dipilih." }, { status: 400 });
  if (!allowed(String(body.mime_type || ""))) return NextResponse.json({ success: false, data: null, message: "Tipe file tidak didukung." }, { status: 400 });
  if (Number(body.file_size_bytes) > MAX_BYTES) return NextResponse.json({ success: false, data: null, message: "Ukuran file melebihi batas 10 MB." }, { status: 400 });
  const url = new URL(base); url.searchParams.set("action", "addJobMedia");
  try { const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" }); return NextResponse.json(await response.json(), { status: response.ok ? 200 : response.status }); }
  catch { return NextResponse.json({ success: false, data: null, message: "Upload media gagal terhubung ke backend." }, { status: 500 }); }
}

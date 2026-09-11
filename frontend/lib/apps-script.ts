import "server-only";

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  message: string;
};

export type HealthData = {
  environment: string;
  timezone: string;
  spreadsheet: { accessible: boolean; title: string };
  mediaFolders: {
    root: { accessible: boolean; name: string };
    jobs: { accessible: boolean; name: string };
    expenses: { accessible: boolean; name: string };
    payments: { accessible: boolean; name: string };
  };
  sheets: Record<string, boolean>;
  testWrite: { written: boolean; readBack: boolean; cleaned: boolean };
};

function isEnvelope(value: unknown): value is ApiEnvelope<HealthData> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.success === "boolean" &&
    "data" in candidate &&
    typeof candidate.message === "string"
  );
}

export async function getFoundationHealth(): Promise<ApiEnvelope<HealthData>> {
  const baseUrl = process.env.APPS_SCRIPT_API_URL;
  if (!baseUrl) {
    return { success: false, data: null, message: "APPS_SCRIPT_API_URL belum dikonfigurasi." };
  }

  const url = new URL(baseUrl);
  url.searchParams.set("action", "healthCheck");

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    const raw = (await response.json()) as unknown;
    if (!isEnvelope(raw)) {
      return { success: false, data: null, message: "Format response Apps Script tidak valid." };
    }
    if (!response.ok) {
      return { success: false, data: null, message: raw.message || "Apps Script mengembalikan HTTP error." };
    }
    return raw;
  } catch {
    return { success: false, data: null, message: "Tidak dapat terhubung ke Apps Script API." };
  }
}

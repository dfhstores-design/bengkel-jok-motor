"use client";
import { FormEvent, useEffect, useState } from "react";
type Mode = "OWNER" | "OPERATOR";
type View =
  | "home"
  | "jobs"
  | "new"
  | "report"
  | "expense"
  | "history"
  | "settings"
  | "sales";
type Media = {
  media_id?: string;
  category: string;
  media_type: string;
  drive_file_url: string;
  file_name: string;
};
type Auth = {
  user_id: string;
  display_name: string;
  role: Mode;
  last_activity: string;
};
type LoginUser = { user_id: string; display_name: string; role: Mode };
type Job = {
  job_id: string;
  status: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  motorcycle_model: string;
  work_description: string;
  agreed_price: number;
  customer_name: string;
  customer_whatsapp: string;
  notes: string;
  closed_at: string;
  payment?: { amount: number; payment_method: string; created_by?: string };
  media?: Media[];
};
type Expense = {
  expense_id: string;
  expense_date: string;
  category: string;
  item_name: string;
  total_amount: number;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  supplier: string;
  notes: string;
};
type Dash = {
  as_of: string;
  active_job_count: number;
  income_today: number;
  income_month: number;
  expense_month: number;
  inconsistencies: { job_id: string }[];
  active_jobs: Job[];
};
type Recap = {
  date_from: string;
  date_to: string;
  snapshot: {
    total_income: number;
    total_expense: number;
    difference: number;
    closed_job_count: number;
    inconsistencies: { job_id: string }[];
  };
};
const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
const key = () => `s7-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const localToday = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};
const monthStart = (date: string) => `${date.slice(0, 7)}-01`;
const blankJob = {
  motorcycle_model: "",
  work_type: "",
  work_description: "",
  agreed_price: "",
  customer_name: "",
  customer_whatsapp: "",
  notes: "",
};
const blankExp = {
  item_name: "",
  total_amount: "",
  category: "OTHER",
  quantity: "",
  unit: "",
  unit_price: "",
  supplier: "",
  notes: "",
};
function Chart({ recap, history }: { recap: Recap | null; history: Job[] }) {
  if (!recap) return null;
  const end = new Date(`${recap.date_to}T00:00:00`);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });
  const points = days.map((day) => ({
    day: day.slice(8),
    income: history
      .filter((j) => j.closed_at?.slice(0, 10) === day)
      .reduce((sum, j) => sum + Number(j.payment?.amount || 0), 0),
    jobs: history.filter((j) => j.closed_at?.slice(0, 10) === day).length,
  }));
  const max = Math.max(...points.map((x) => x.income), 1);
  return (
    <section className="b-card chart-card">
      <div className="b-section-title">
        <div>
          <p className="b-eyebrow">RINGKASAN GRAFIK</p>
          <h2>Penjualan 7 hari terakhir</h2>
          <small>Pemasukan dan jumlah Job selesai</small>
        </div>
      </div>
      <div className="b-chart b-chart-week">
        {points.map((x) => (
          <div className="b-bar" key={x.day}>
            <div className="b-stack">
              <i
                className="in"
                style={{
                  height: `${Math.max(x.income ? 25 : 4, Math.round((x.income / max) * 84))}px`,
                }}
              >
                {x.income ? money(x.income) : "Rp 0"}
              </i>
              <i
                className="jobs"
                style={{ height: `${Math.max(22, x.jobs * 25)}px` }}
              >
                {x.jobs} Job
              </i>
            </div>
            <small>
              {x.day}/{recap.date_to.slice(5, 7)}
            </small>
          </div>
        ))}
      </div>
      <div className="b-legend">
        <span>
          <i className="in" />
          Pemasukan (Rp)
        </span>
        <span>
          <i className="jobs" />
          Job selesai
        </span>
      </div>
    </section>
  );
}
function PeriodControls({
  from,
  to,
  preset,
  onPresetChange,
  onFromChange,
  onToChange,
  onApply,
}: {
  from: string;
  to: string;
  preset: string;
  onPresetChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApply: () => void;
}) {
  return (
    <section className="b-card b-global-period">
      <div>
        <p className="b-eyebrow">PERIODE DATA</p>
        <h2>Pilih periode</h2>
        <small>
          Ringkasan, Job, Belanja, dan Riwayat mengikuti periode ini.
        </small>
      </div>
      <select
        aria-label="Preset periode"
        value={preset}
        onChange={(e) => onPresetChange(e.target.value)}
      >
        <option value="month">Bulan ini</option>
        <option value="3m">3 bulan terakhir</option>
        <option value="all">Semua data</option>
        <option value="custom">Tanggal tertentu</option>
      </select>
      <div className="b-date-range">
        <label>
          Dari
          <input
            aria-label="Tanggal mulai"
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
          />
        </label>
        <label>
          Sampai
          <input
            aria-label="Tanggal akhir"
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
          />
        </label>
      </div>
      <button className="b-primary" onClick={onApply}>
        Terapkan periode
      </button>
    </section>
  );
}
function SalesInsights({
  recap,
  history,
  onRefresh,
}: {
  recap: Recap | null;
  history: Job[];
  onRefresh: () => void;
}) {
  if (!recap) return null;
  const models = Object.values(
    history.reduce<
      Record<string, { model: string; jobs: number; income: number }>
    >((all, job) => {
      const model = job.motorcycle_model || "Tanpa model";
      const item = all[model] || { model, jobs: 0, income: 0 };
      item.jobs += 1;
      item.income += Number(job.payment?.amount || 0);
      all[model] = item;
      return all;
    }, {}),
  )
    .sort((a, b) => b.income - a.income || b.jobs - a.jobs)
    .slice(0, 5);
  const end = new Date(`${recap.date_to}T00:00:00`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(end);
    day.setDate(end.getDate() - 6 + index);
    return day.toISOString().slice(0, 10);
  });
  const points = days.map((day) => ({
    day,
    income: history
      .filter((job) => job.closed_at?.slice(0, 10) === day)
      .reduce((sum, job) => sum + Number(job.payment?.amount || 0), 0),
  }));
  const max = Math.max(...points.map((point) => point.income), 1);
  return (
    <>
      <section className="b-card b-sales-summary">
        <div className="b-section-title">
          <div>
            <h2>Penjualan</h2>
            <small>Ringkasan berdasarkan data Job dan Payment.</small>
          </div>
          <button onClick={onRefresh}>Refresh</button>
        </div>
        <div className="b-metrics">
          <div>
            <small>Omzet periode</small>
            <b>{money(recap.snapshot.total_income)}</b>
          </div>
          <div>
            <small>Job CLOSED</small>
            <b>{recap.snapshot.closed_job_count}</b>
          </div>
          <div>
            <small>Rata-rata Job</small>
            <b>
              {money(
                recap.snapshot.closed_job_count
                  ? recap.snapshot.total_income /
                      recap.snapshot.closed_job_count
                  : 0,
              )}
            </b>
          </div>
          <div>
            <small>Margin</small>
            <b>{money(recap.snapshot.difference)}</b>
          </div>
        </div>
      </section>
      <section className="b-card">
        <div className="b-section-title">
          <h2>Pekerjaan terlaris</h2>
        </div>
        {models.length ? (
          <div className="b-top-products">
            {models.map((item) => (
              <div className="b-product" key={item.model}>
                <div>
                  <strong>{item.model}</strong>
                  <small>
                    {item.jobs} Job · {money(item.income)}
                  </small>
                </div>
                <b>
                  {Math.round(
                    (item.income / Math.max(recap.snapshot.total_income, 1)) *
                      100,
                  )}
                  %
                </b>
                <span>
                  <i
                    style={{
                      width: `${Math.max(4, Math.round((item.income / Math.max(models[0].income, 1)) * 100))}%`,
                    }}
                  />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">Belum ada Job CLOSED pada periode ini.</p>
        )}
      </section>
      <section className="b-card">
        <div className="b-section-title">
          <h2>Grafik omzet harian</h2>
        </div>
        <div className="b-sales-chart">
          {points.map((point) => (
            <div className="b-sales-bar" key={point.day}>
              <strong
                style={{
                  height: `${Math.max(point.income ? 12 : 4, Math.round((point.income / max) * 120))}px`,
                }}
              />
              {point.income > 0 && <small>{money(point.income)}</small>}
              <em>
                {point.day.slice(8)}/{point.day.slice(5, 7)}
              </em>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default function Home() {
  const today = localToday();
  const [periodFrom, setPeriodFrom] = useState(monthStart(today)),
    [periodTo, setPeriodTo] = useState(today),
    [periodPreset, setPeriodPreset] = useState("month");
  const [auth, setAuth] = useState<Auth | null | undefined>(undefined),
    [users, setUsers] = useState<LoginUser[]>([]),
    [role, setRole] = useState<Mode>("OWNER"),
    [pin, setPin] = useState(""),
    [authBusy, setAuthBusy] = useState(false),
    [view, setView] = useState<View>("home"),
    [dash, setDash] = useState<Dash | null>(null),
    [recap, setRecap] = useState<Recap | null>(null),
    [history, setHistory] = useState<Job[]>([]),
    [expenses, setExpenses] = useState<Expense[]>([]),
    [job, setJob] = useState(blankJob),
    [exp, setExp] = useState(blankExp),
    [detail, setDetail] = useState<Job | null>(null),
    [busy, setBusy] = useState(false),
    [detailBusy, setDetailBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [menuOpen, setMenuOpen] = useState(false);
  const owner = auth?.role === "OWNER";
  const loginUser = users.find((u) => u.role === role);
  const notify = (e = "", m = "") => {
    setError(e);
    setMessage(m);
  };
  async function load(from = periodFrom, to = periodTo) {
    if (!auth) return;
    const qs = `?date_from=${encodeURIComponent(from)}&date_to=${encodeURIComponent(to)}`;
    const read = async (path: string) => {
      try {
        const response = await fetch(path, { cache: "no-store" });
        return await response.json();
      } catch {
        return { success: false };
      }
    };
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const [d, r, h, e] = await Promise.all([
        read("/api/dashboard"),
        read(`/api/recap${qs}`),
        read(`/api/history${qs}`),
        read(`/api/expenses${qs}`),
      ]);
      if (d.success) setDash(d.data);
      if (r.success) setRecap(r.data);
      if (h.success) setHistory(h.data || []);
      if (e.success) setExpenses(e.data || []);
      if (d.success && r.success && h.success && e.success) return;
      if (attempt === 0)
        await new Promise((resolve) => setTimeout(resolve, 900));
    }
    setError(
      "Data periode belum termuat lengkap. Tekan Terapkan periode untuk mencoba lagi.",
    );
  }
  function applyPeriod() {
    if (!periodFrom || !periodTo || periodFrom > periodTo) {
      setError("Periode tanggal tidak valid.");
      return;
    }
    load(periodFrom, periodTo);
  }
  function choosePreset(value: string) {
    setPeriodPreset(value);
    const end = localToday();
    if (value === "month") {
      const from = monthStart(end);
      setPeriodFrom(from);
      setPeriodTo(end);
      load(from, end);
      return;
    }
    if (value === "3m") {
      const d = new Date(`${end}T00:00:00`);
      d.setMonth(d.getMonth() - 2);
      const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      setPeriodFrom(from);
      setPeriodTo(end);
      load(from, end);
      return;
    }
    if (value === "all") {
      const from = "2020-01-01";
      setPeriodFrom(from);
      setPeriodTo(end);
      load(from, end);
    }
  }
  useEffect(() => {
    fetch("/api/auth/users", { cache: "no-store" })
      .then((x) => x.json())
      .then((r) => {
        if (r.success) setUsers(r.data || []);
      })
      .catch(() => {});
    fetch("/api/auth/session", { cache: "no-store" })
      .then((x) => x.json())
      .then((r) => {
        if (r.success) {
          setAuth(r.data);
          setRole(r.data.role);
        } else setAuth(null);
      })
      .catch(() => setAuth(null));
  }, []);
  useEffect(() => {
    if (auth) load();
  }, [auth]);
  async function login(e: FormEvent) {
    e.preventDefault();
    if (authBusy || !loginUser || pin.length < 4) return;
    setAuthBusy(true);
    notify();
    try {
      for (let i = 0; i < 2; i += 1) {
        try {
          const r = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: loginUser.user_id, pin }),
          }).then((x) => x.json());
          if (!r.success) {
            const transient = /terhubung|backend|koneksi|timeout/i.test(
              String(r.message || ""),
            );
            if (!transient || i === 1) {
              setError(r.message || "Login gagal.");
              return;
            }
            await new Promise((resolve) => setTimeout(resolve, 800));
            continue;
          }
          setAuth(r.data);
          setRole(r.data.role);
          setView("home");
          setPin("");
          return;
        } catch {
          if (i === 1) setError("Login gagal. Periksa koneksi lalu coba lagi.");
          else await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    } finally {
      setAuthBusy(false);
    }
  }
  async function logout() {
    setAuthBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setAuth(null);
      setView("home");
      setPin("");
      setAuthBusy(false);
    }
  }
  function press(n: string) {
    if (n === "C") return setPin("");
    if (n === "⌫") return setPin(pin.slice(0, -1));
    if (pin.length < 8) setPin(pin + n);
  }
  async function createJob(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    notify();
    try {
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...job,
          work_description: `${job.work_type}: ${job.work_description}`.trim(),
          idempotency_key: key(),
        }),
      }).then((x) => x.json());
      if (!r.success) {
        setError(r.message);
        return;
      }
      setJob(blankJob);
      await load();
      setView("jobs");
      notify("", "Job baru berhasil disimpan.");
    } catch {
      setError(
        "Job belum dapat dipastikan tersimpan. Periksa daftar Job sebelum mengirim ulang.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function createExpense(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    notify();
    try {
      const r = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...exp, idempotency_key: key() }),
      }).then((x) => x.json());
      if (!r.success) {
        setError(r.message);
        return;
      }
      setExp(blankExp);
      await load();
      notify("", "Pengeluaran berhasil disimpan.");
    } catch {
      setError(
        "Pengeluaran belum dapat dipastikan tersimpan. Periksa riwayat sebelum mencoba lagi.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function openDetail(id: string) {
    setDetailBusy(true);
    try {
      const r = await fetch(`/api/jobs/${encodeURIComponent(id)}`, {
        cache: "no-store",
      }).then((x) => x.json());
      if (r.success) setDetail(r.data);
      else setError(r.message);
    } finally {
      setDetailBusy(false);
    }
  }
  async function closeJob(e: FormEvent) {
    e.preventDefault();
    if (!detail || detailBusy) return;
    setDetailBusy(true);
    const d = new FormData(e.currentTarget as HTMLFormElement);
    try {
      const r = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: detail.job_id,
          amount: Number(d.get("amount")),
          payment_method: String(d.get("payment_method")),
          note: String(d.get("note") || ""),
          idempotency_key: key(),
        }),
      }).then((x) => x.json());
      if (!r.success) {
        setError(r.message);
        return;
      }
      setDetail(null);
      await load();
      notify("", "Payment berhasil dicatat dan Job CLOSED.");
    } finally {
      setDetailBusy(false);
    }
  }
  async function uploadMedia(e: FormEvent) {
    e.preventDefault();
    if (!detail || detailBusy) return;
    const form = e.currentTarget as HTMLFormElement;
    const file = (form.elements.namedItem("file") as HTMLInputElement)
      .files?.[0];
    if (!file) {
      setError("Pilih file media terlebih dahulu.");
      return;
    }
    setDetailBusy(true);
    try {
      const encoded = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(file);
      });
      const d = new FormData(form);
      const r = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: detail.job_id,
          category: String(d.get("category")),
          media_type: file.type.startsWith("video/") ? "VIDEO" : "PHOTO",
          file_name: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
          file_base64: encoded,
          idempotency_key: key(),
        }),
      }).then((x) => x.json());
      if (!r.success) {
        setError(r.message);
        return;
      }
      await openDetail(detail.job_id);
      notify("", "Media berhasil diunggah.");
      form.reset();
    } catch {
      setError(
        "Upload media gagal. Job tetap aman dan file dapat dicoba lagi.",
      );
    } finally {
      setDetailBusy(false);
    }
  }
  async function editHistory(e: FormEvent) {
    e.preventDefault();
    if (!detail || detailBusy || !owner) return;
    setDetailBusy(true);
    const d = new FormData(e.currentTarget as HTMLFormElement);
    try {
      const r = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: detail.job_id,
          customer_name: String(d.get("customer_name") || ""),
          customer_whatsapp: String(d.get("customer_whatsapp") || ""),
          work_description: String(d.get("work_description") || ""),
          notes: String(d.get("notes") || ""),
          idempotency_key: key(),
        }),
      }).then((x) => x.json());
      if (!r.success) {
        setError(r.message);
        return;
      }
      setDetail(r.data.job);
      await load();
      notify("", "Riwayat berhasil diperbarui dan audit tersimpan.");
    } finally {
      setDetailBusy(false);
    }
  }
  function exportReport(kind: "pdf" | "xls") {
    if (!recap) return;
    const rows = history.map((j) => [
      j.closed_at,
      j.job_id,
      j.motorcycle_model,
      j.work_description,
      j.status,
      j.payment?.amount || 0,
      j.agreed_price,
    ]);
    const plain = [
      "LAPORAN BULANAN MOTOKRAF",
      "Periode: " + recap.date_from + " s/d " + recap.date_to,
      "",
      "Pemasukan: " + money(recap.snapshot.total_income),
      "Pengeluaran: " + money(recap.snapshot.total_expense),
      "Margin: " + money(recap.snapshot.difference),
      "Job CLOSED: " + recap.snapshot.closed_job_count,
      "",
      ...rows.map((r) => r.join(" | ")),
    ];
    let blob: Blob;
    if (kind === "xls") {
      const esc = (v: string | number) =>
        String(v)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      const html = `<html><head><meta charset="utf-8"></head><body><h1>LAPORAN BULANAN MOTOKRAF</h1><p>Periode: ${esc(recap.date_from)} s/d ${esc(recap.date_to)}</p><table border="1"><tr><th>Tanggal</th><th>Job ID</th><th>Model</th><th>Pekerjaan</th><th>Status</th><th>Payment</th><th>Harga deal</th></tr>${rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
      blob = new Blob([html], { type: "application/vnd.ms-excel" });
    } else {
      const safe = (v: string) => v.replace(/[()\\]/g, (ch) => `\\${ch}`);
      const commands = [
        "BT",
        "/F1 11 Tf",
        "50 790 Td",
        ...plain.flatMap((line, i) => [
          i ? "0 -16 Td" : "",
          `(${safe(line)}) Tj`,
        ]),
        "ET",
      ]
        .filter(Boolean)
        .join("\\n");
      const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        `<< /Length ${commands.length} >>\\nstream\\n${commands}\\nendstream`,
      ];
      let pdf = "%PDF-1.4\\n";
      const offsets = [0];
      objects.forEach((obj, i) => {
        offsets.push(pdf.length);
        pdf += `${i + 1} 0 obj\\n${obj}\\nendobj\\n`;
      });
      const xref = pdf.length;
      pdf += `xref\\n0 ${objects.length + 1}\\n0000000000 65535 f \\n${offsets
        .slice(1)
        .map((n) => `${String(n).padStart(10, "0")} 00000 n \\n`)
        .join(
          "",
        )}trailer\\n<< /Size ${objects.length + 1} /Root 1 0 R >>\\nstartxref\\n${xref}\\n%%EOF`;
      blob = new Blob([pdf], { type: "application/pdf" });
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `laporan-motokraf-${recap.date_from.slice(0, 7)}.${kind}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  }
  if (auth === undefined)
    return (
      <main className="b-login">
        <div className="b-login-wrap">
          <h1>MOTOKRAF</h1>
          <p>Operasional Bengkel Jok Motor</p>
          <section className="b-login-card">
            <img src="/motokraf-site-ico.webp" alt="Motokraf" />
            <h2>Memuat sesi…</h2>
          </section>
        </div>
      </main>
    );
  if (!auth)
    return (
      <main className="b-login">
        <div className="b-login-wrap">
          <h1>MOTOKRAF</h1>
          <p>Operasional Bengkel Jok Motor</p>
          <section className="b-login-card">
            <img src="/motokraf-site-ico.webp" alt="Motokraf" />
            <h2>Masuk ke Sistem</h2>
            <p>Pilih peran dan masukkan PIN</p>
            <div className="b-role">
              <button
                className={role === "OWNER" ? "selected" : ""}
                onClick={() => setRole("OWNER")}
              >
                OWNER
              </button>
              <button
                className={role === "OPERATOR" ? "selected" : ""}
                onClick={() => setRole("OPERATOR")}
              >
                OPERATOR
              </button>
            </div>
            <div className="b-pin">
              {pin ? "• ".repeat(pin.length) : "• • • •"}
            </div>
            <form onSubmit={login}>
              <div className="b-keypad">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "C",
                  "0",
                  "⌫",
                ].map((n) => (
                  <button type="button" key={n} onClick={() => press(n)}>
                    {n}
                  </button>
                ))}
              </div>
              <button
                className="b-primary"
                disabled={authBusy || !loginUser || pin.length < 4}
              >
                {authBusy ? "MEMERIKSA…" : "↪ MASUK"}
              </button>
            </form>
            {error && <p className="error banner">{error}</p>}
            <small>
              PIN bersifat rahasia
              <br />
              Jangan bagikan PIN kepada pihak lain.
            </small>
          </section>
        </div>
      </main>
    );
  const active = (dash?.active_jobs || []).filter(
    (j) =>
      j.created_at.slice(0, 10) >= periodFrom &&
      j.created_at.slice(0, 10) <= periodTo,
  );
  const period = recap ? `${recap.date_from} s/d ${recap.date_to}` : "Memuat…";
  return (
    <main className="b-app">
      <header className="b-top">
        <div>
          <p className="b-eyebrow">MOTOKRAF · {auth.role}</p>
          <h1>
            {view === "report"
              ? "Laporan Owner"
              : view === "sales"
                ? "Penjualan"
                : view === "history"
                  ? "Riwayat Job"
                  : view === "expense"
                    ? "Pengeluaran"
                    : view === "settings"
                      ? "Pengaturan PIN"
                      : view === "jobs"
                        ? "Job Aktif"
                        : "Operasional Bengkel"}
          </h1>
          <small>{auth.display_name}</small>
        </div>
        <button
          className="b-avatar"
          onClick={() => (owner ? setMenuOpen(true) : logout())}
        >
          {owner ? "☰" : "↪"}
        </button>
      </header>
      {menuOpen && owner && (
        <div className="b-drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <aside className="b-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="b-drawer-head">
              <h2>Menu Owner</h2>
              <button onClick={() => setMenuOpen(false)}>×</button>
            </div>
            <nav>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setView("home");
                }}
              >
                <span>⌂</span>Ringkasan
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setView("jobs");
                }}
              >
                <span>▣</span>Job Aktif
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setView("expense");
                }}
              >
                <span>🛒</span>Pengeluaran
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setView("history");
                }}
              >
                <span>▤</span>Riwayat Job
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setView("settings");
                }}
              >
                <span>⚙</span>Pengaturan PIN
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setView("report");
                }}
              >
                <span>▤</span>Laporan Bulanan
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setView("sales");
                }}
              >
                <span>↗</span>Penjualan
              </button>
            </nav>
          </aside>
        </div>
      )}
      {(error || message) && (
        <p className={error ? "error b-banner" : "ok b-banner"}>
          {error || message}
        </p>
      )}
      <div className="b-content">
        <PeriodControls
          from={periodFrom}
          to={periodTo}
          preset={periodPreset}
          onPresetChange={choosePreset}
          onFromChange={(v) => {
            setPeriodFrom(v);
            setPeriodPreset("custom");
          }}
          onToChange={(v) => {
            setPeriodTo(v);
            setPeriodPreset("custom");
          }}
          onApply={applyPeriod}
        />
        {view === "home" && owner && (
          <>
            <section className="b-card b-welcome">
              <div>
                <h2>Selamat datang, Owner!</h2>
                <p>Pantau pekerjaan dan uang masuk hari ini.</p>
              </div>
              <img src="/motokraf-site-ico.webp" alt="Motokraf" />
            </section>
            <section className="b-card b-period">
              <div>
                <small>Periode laporan</small>
                <strong>{period}</strong>
              </div>
              <div className="b-period-actions">
                <button onClick={() => load()}>Refresh</button>
                <button onClick={() => setView("report")}>Laporan</button>
              </div>
            </section>
            <div className="b-section-title">
              <h2>RINGKASAN HARI INI</h2>
            </div>
            <div className="b-metrics">
              <div>
                <small>Job aktif</small>
                <b>{dash?.active_job_count || 0}</b>
              </div>
              <div>
                <small>Pemasukan periode</small>
                <b>{money(recap?.snapshot.total_income || 0)}</b>
              </div>
              <div>
                <small>Pengeluaran periode</small>
                <b>{money(recap?.snapshot.total_expense || 0)}</b>
              </div>
              <div>
                <small>Job selesai</small>
                <b>{recap?.snapshot.closed_job_count || 0}</b>
              </div>
            </div>
            <section className="b-card b-wide">
              <span className="b-wide-icon">♧</span>
              <div>
                <small>Total pengeluaran periode</small>
                <strong>{money(recap?.snapshot.total_expense || 0)}</strong>
              </div>
            </section>
            <section className="b-card b-wide b-rose">
              <span className="b-wide-icon">Rp</span>
              <div>
                <small>Perlu diperiksa</small>
                <strong>{active.length} Job belum ditutup</strong>
              </div>
            </section>
            <section className="b-card b-wide b-green">
              <span className="b-wide-icon">↗</span>
              <div>
                <small>Pemasukan - pengeluaran</small>
                <strong>{money(recap?.snapshot.difference || 0)}</strong>
              </div>
            </section>
            <Chart recap={recap} history={history} />
            <button className="b-secondary" onClick={() => setView("history")}>
              Lihat Riwayat CLOSED
            </button>
          </>
        )}
        {(view === "home" || view === "new" || view === "jobs") && (
          <>
            {view === "new" && (
              <section className="b-card b-form">
                <p className="b-eyebrow">PEKERJAAN BARU</p>
                <h2>Mulai Kerja</h2>
                <form onSubmit={createJob}>
                  <label>
                    Model motor *
                    <input
                      required
                      value={job.motorcycle_model}
                      onChange={(e) =>
                        setJob({ ...job, motorcycle_model: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Jenis pekerjaan *
                    <input
                      required
                      value={job.work_type}
                      onChange={(e) =>
                        setJob({ ...job, work_type: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Deskripsi pekerjaan *
                    <textarea
                      required
                      value={job.work_description}
                      onChange={(e) =>
                        setJob({ ...job, work_description: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Harga deal (Rp) *
                    <input
                      required
                      type="number"
                      inputMode="numeric"
                      value={job.agreed_price}
                      onChange={(e) =>
                        setJob({ ...job, agreed_price: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Nama pelanggan
                    <input
                      value={job.customer_name}
                      onChange={(e) =>
                        setJob({ ...job, customer_name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    WhatsApp
                    <input
                      inputMode="tel"
                      value={job.customer_whatsapp}
                      onChange={(e) =>
                        setJob({ ...job, customer_whatsapp: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Catatan
                    <textarea
                      value={job.notes}
                      onChange={(e) =>
                        setJob({ ...job, notes: e.target.value })
                      }
                    />
                  </label>
                  <button className="b-primary" disabled={busy}>
                    {busy ? "Memproses…" : "Mulai Kerja"}
                  </button>
                </form>
              </section>
            )}
            <section className="b-card">
              <div className="b-section-title">
                <h2>PEKERJAAN AKTIF</h2>
                <div className="b-section-actions">
                  <b>{active.length}</b>
                  <button className="b-add" onClick={() => setView("new")}>
                    ＋ Tambah Job
                  </button>
                </div>
              </div>
              {active.map((j) => (
                <button
                  className="b-job"
                  key={j.job_id}
                  onClick={() => openDetail(j.job_id)}
                >
                  <span>
                    <strong>{j.motorcycle_model}</strong>
                    <small>{j.work_description}</small>
                  </span>
                  <span>
                    <b>{money(Number(j.agreed_price))}</b>
                    <small>Periksa pekerjaan</small>
                  </span>
                </button>
              ))}
              {!active.length && <p className="empty">Belum ada Job aktif.</p>}
            </section>
          </>
        )}
        {view === "sales" && owner && (
          <SalesInsights
            recap={recap}
            history={history}
            onRefresh={() => load()}
          />
        )}
        {view === "report" && owner && (
          <section className="b-card b-form">
            <p className="b-eyebrow">LAPORAN OWNER</p>
            <h2>Laporan Bulanan</h2>
            <p className="help">
              Ringkasan dihitung dari Payment dan Pengeluaran. Job aktif tidak
              dihitung sebagai pemasukan.
            </p>
            <p className="b-period-line">{period}</p>
            <div className="b-metrics">
              <div>
                <small>Pemasukan</small>
                <b>{money(recap?.snapshot.total_income || 0)}</b>
              </div>
              <div>
                <small>Margin</small>
                <b>{money(recap?.snapshot.difference || 0)}</b>
              </div>
              <div>
                <small>Pengeluaran</small>
                <b>{money(recap?.snapshot.total_expense || 0)}</b>
              </div>
              <div>
                <small>Job CLOSED</small>
                <b>{recap?.snapshot.closed_job_count || 0}</b>
              </div>
            </div>
            <div className="b-download">
              <button className="b-primary" onClick={() => exportReport("pdf")}>
                ↓ Download PDF
              </button>
              <button onClick={() => exportReport("xls")}>
                ↓ Download Excel
              </button>
            </div>
          </section>
        )}
        {view === "history" && owner && (
          <section className="b-card">
            <p className="b-eyebrow">RIWAYAT</p>
            <h2>Riwayat Job CLOSED</h2>
            {history.map((j) => (
              <button
                className="b-job"
                key={j.job_id}
                onClick={() => openDetail(j.job_id)}
              >
                <span>
                  <strong>{j.motorcycle_model}</strong>
                  <small>{j.work_description}</small>
                  <small>{j.customer_name || "Tanpa nama customer"}</small>
                </span>
                <span>
                  <b>{money(Number(j.agreed_price))}</b>
                  <small>{j.closed_at}</small>
                </span>
              </button>
            ))}
          </section>
        )}
        {view === "settings" && owner && (
          <section className="b-card b-form">
            <p className="b-eyebrow">PENGATURAN</p>
            <h2>Pengaturan PIN</h2>
            <p className="help">
              Pengelolaan PIN dilakukan oleh Owner. Perubahan PIN akan disimpan
              sebagai hash di backend.
            </p>
            <p className="empty">
              Form perubahan PIN akan diaktifkan setelah endpoint pengelolaan
              user selesai diverifikasi.
            </p>
          </section>
        )}{" "}
        {view === "expense" && owner && (
          <section className="b-card b-form">
            <p className="b-eyebrow">PENGELUARAN</p>
            <h2>Belanja & operasional</h2>
            <p className="help">
              Catat pengeluaran bahan dan operasional agar insight usaha tetap
              akurat.
            </p>
            <form onSubmit={createExpense}>
              <label>
                Nama bahan / keperluan *
                <input
                  required
                  value={exp.item_name}
                  onChange={(e) =>
                    setExp({ ...exp, item_name: e.target.value })
                  }
                />
              </label>
              <label>
                Total biaya (Rp) *
                <input
                  required
                  type="number"
                  inputMode="numeric"
                  value={exp.total_amount}
                  onChange={(e) =>
                    setExp({ ...exp, total_amount: e.target.value })
                  }
                />
              </label>
              <label>
                Kategori
                <select
                  value={exp.category}
                  onChange={(e) => setExp({ ...exp, category: e.target.value })}
                >
                  <option>MATERIAL</option>
                  <option>OPERATIONAL</option>
                  <option>TOOL</option>
                  <option>OTHER</option>
                </select>
              </label>
              <label>
                Quantity
                <input
                  value={exp.quantity}
                  onChange={(e) => setExp({ ...exp, quantity: e.target.value })}
                />
              </label>
              <label>
                Satuan
                <input
                  value={exp.unit}
                  onChange={(e) => setExp({ ...exp, unit: e.target.value })}
                />
              </label>
              <label>
                Tempat beli
                <input
                  value={exp.supplier}
                  onChange={(e) => setExp({ ...exp, supplier: e.target.value })}
                />
              </label>
              <label>
                Catatan
                <textarea
                  value={exp.notes}
                  onChange={(e) => setExp({ ...exp, notes: e.target.value })}
                />
              </label>
              <button className="b-primary" disabled={busy}>
                {busy ? "Menyimpan…" : "Simpan Pengeluaran"}
              </button>
            </form>
            {expenses.map((x) => (
              <div className="b-expense" key={x.expense_id}>
                <span>
                  <b>{x.item_name}</b>
                  <small>
                    {x.expense_date} · {x.category}
                  </small>
                </span>
                <b>{money(Number(x.total_amount))}</b>
              </div>
            ))}
          </section>
        )}
      </div>
      <nav className="b-bottom">
        {owner ? (
          <>
            <button
              className={view === "home" ? "active" : ""}
              onClick={() => setView("home")}
            >
              ⌂<small>Ringkasan</small>
            </button>
            <button
              className={view === "expense" ? "active" : ""}
              onClick={() => setView("expense")}
            >
              🛒<small>Belanja</small>
            </button>
            <button
              className={view === "sales" ? "active" : ""}
              onClick={() => setView("sales")}
            >
              ↗<small>Penjualan</small>
            </button>
            <button
              className={view === "report" ? "active" : ""}
              onClick={() => setView("report")}
            >
              ▤<small>Laporan</small>
            </button>
          </>
        ) : (
          <>
            <button
              className={view === "jobs" || view === "home" ? "active" : ""}
              onClick={() => setView("jobs")}
            >
              ▣<small>Job Aktif</small>
            </button>
            <button
              className={view === "new" ? "active" : ""}
              onClick={() => setView("new")}
            >
              ＋<small>Tambah Job</small>
            </button>
          </>
        )}
        <button onClick={logout}>
          ↪<small>Keluar</small>
        </button>
      </nav>
      {detail && (
        <div className="b-modal" onClick={() => setDetail(null)}>
          <article onClick={(e) => e.stopPropagation()}>
            <button className="b-close" onClick={() => setDetail(null)}>
              Tutup
            </button>
            <p className="b-eyebrow">JOB DETAIL</p>
            <h2>{detail.motorcycle_model}</h2>
            <span className="badge">{detail.status}</span>
            <p>
              Pekerjaan
              <br />
              <strong>{detail.work_description}</strong>
            </p>
            <p>
              Harga deal
              <br />
              <strong>{money(Number(detail.agreed_price))}</strong>
            </p>
            {detail.payment && (
              <p>
                Payment
                <br />
                <strong>
                  {money(Number(detail.payment.amount))} ·{" "}
                  {detail.payment.payment_method}
                </strong>
              </p>
            )}
            {detail.status === "IN_PROGRESS" && (
              <>
                <form onSubmit={closeJob}>
                  <h3>Catat Pembayaran & Close</h3>
                  <label>
                    Nominal
                    <input
                      required
                      type="number"
                      name="amount"
                      defaultValue={detail.agreed_price}
                    />
                  </label>
                  <label>
                    Metode
                    <select name="payment_method">
                      <option>CASH</option>
                      <option>TRANSFER</option>
                      <option>QRIS</option>
                      <option>OTHER</option>
                    </select>
                  </label>
                  <button className="b-primary" disabled={detailBusy}>
                    {detailBusy ? "Memproses…" : "Simpan Payment & Close"}
                  </button>
                </form>
                <form onSubmit={uploadMedia}>
                  <h3>Tambah Media</h3>
                  <label>
                    Kategori
                    <select name="category" defaultValue="BEFORE">
                      <option>BEFORE</option>
                      <option>PROCESS</option>
                      <option>AFTER</option>
                    </select>
                  </label>
                  <label>
                    File foto/video
                    <input
                      required
                      name="file"
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      capture="environment"
                    />
                  </label>
                  <button className="b-primary" disabled={detailBusy}>
                    {detailBusy ? "Mengunggah…" : "Upload Media"}
                  </button>
                </form>
              </>
            )}
            {detail.status === "CLOSED" && owner && (
              <form onSubmit={editHistory}>
                <h3>Edit Riwayat Owner</h3>
                <label>
                  Deskripsi pekerjaan
                  <textarea
                    name="work_description"
                    defaultValue={detail.work_description}
                  />
                </label>
                <label>
                  Nama pelanggan
                  <input
                    name="customer_name"
                    defaultValue={detail.customer_name}
                  />
                </label>
                <label>
                  WhatsApp
                  <input
                    name="customer_whatsapp"
                    defaultValue={detail.customer_whatsapp}
                  />
                </label>
                <label>
                  Catatan
                  <textarea name="notes" defaultValue={detail.notes} />
                </label>
                <button className="b-primary" disabled={detailBusy}>
                  {detailBusy ? "Menyimpan…" : "Simpan Edit Riwayat"}
                </button>
              </form>
            )}
          </article>
        </div>
      )}
    </main>
  );
}

"use client";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { buildMonthlyReportExcel, buildMonthlyReportPdf, type MonthlyReport } from "@/lib/monthly-report-export";
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
const daysAgo = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};
const dateFromKey = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00`);
const dateKey = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};
const formatPeriodDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateFromKey(value));
const formatRefreshTime = (value: string) =>
  `${new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value))} WIB`;
type PeriodPoint = { key: string; label: string; income: number; jobs: number };
function reportPoints(recap: Recap, history: Job[]): PeriodPoint[] {
  const start = dateFromKey(recap.date_from);
  const end = dateFromKey(recap.date_to);
  const span = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  const daily = new Map<string, { income: number; jobs: number }>();
  history.forEach((job) => {
    const day = job.closed_at?.slice(0, 10);
    if (!day) return;
    const current = daily.get(day) || { income: 0, jobs: 0 };
    current.income += Number(job.payment?.amount || 0);
    current.jobs += 1;
    daily.set(day, current);
  });
  return Array.from({ length: span }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const date = dateKey(day);
    const total = daily.get(date) || { income: 0, jobs: 0 };
    return { key: date, label: `${day.getDate()}/${day.getMonth() + 1}`, ...total };
  });
}
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
function Chart({
  recap,
  history,
  loading,
}: {
  recap: Recap | null;
  history: Job[];
  loading: boolean;
}) {
  if (!recap) return null;
  if (loading)
    return (
      <section className="b-card chart-card b-chart-pending" aria-live="polite">
        <p className="b-eyebrow">RINGKASAN GRAFIK</p>
        <h2>Menyiapkan grafik periode laporan…</h2>
        <small>Rincian pemasukan dan Job selesai sedang dimuat.</small>
      </section>
    );
  const points = reportPoints(recap, history);
  const max = Math.max(...points.map((x) => x.income), 1);
  const chartWidth = 340;
  const chartHeight = 170;
  const left = 12;
  const right = 12;
  const top = 12;
  const bottom = 18;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const coordinates = points.map((point, index) => ({
    ...point,
    x: points.length === 1 ? chartWidth / 2 : left + (index / (points.length - 1)) * plotWidth,
    y: top + (1 - point.income / max) * plotHeight,
  }));
  const line = coordinates.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");
  const area = coordinates.length
    ? `${line} L${coordinates[coordinates.length - 1].x} ${top + plotHeight} L${coordinates[0].x} ${top + plotHeight} Z`
    : "";
  const labelEvery = Math.max(1, Math.ceil(coordinates.length / 7));
  const labels = coordinates.filter((point, index) =>
    index === 0 || index === coordinates.length - 1 || index % labelEvery === 0,
  );
  return (
    <section className="b-card chart-card">
      <div className="b-section-title">
        <div>
          <p className="b-eyebrow">RINGKASAN GRAFIK</p>
          <h2>Penjualan sesuai periode laporan</h2>
          <small>
            {formatPeriodDate(recap.date_from)} – {formatPeriodDate(recap.date_to)} · Pemasukan per hari
          </small>
        </div>
      </div>
      <div className="b-line-chart" role="img" aria-label="Grafik pemasukan per hari sesuai periode laporan">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" aria-hidden="true">
          {[0.2, 0.45, 0.7, 0.95].map((step) => (
            <line key={step} x1={left} x2={chartWidth - right} y1={top + plotHeight * step} y2={top + plotHeight * step} />
          ))}
          <path className="b-line-area" d={area} />
          <path className="b-line-path" d={line} />
        </svg>
        <div className="b-line-labels">
          {labels.map((point) => <small key={point.key} title={`${point.label}: ${money(point.income)}`}>{point.label}</small>)}
        </div>
      </div>
    </section>
  );
}
function PeriodControls({
  from,
  to,
  preset,
  loading,
  refreshedAt,
  onPresetChange,
  onFromChange,
  onToChange,
  onApply,
}: {
  from: string;
  to: string;
  preset: string;
  loading: boolean;
  refreshedAt: string | null;
  onPresetChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApply: () => void;
}) {
  return (
    <section
      className={`b-card b-global-period ${preset === "custom" ? "is-custom" : ""}`}
    >
      <div className="b-period-picker">
        <small>Periode laporan</small>
        <select
          aria-label="Preset periode"
          value={preset}
          onChange={(e) => onPresetChange(e.target.value)}
        >
          <option value="7d">7 hari</option>
          <option value="14d">14 hari</option>
          <option value="30d">30 hari</option>
          <option value="today">Hari ini</option>
          <option value="90d">90 hari</option>
          <option value="all">Semua data</option>
          <option value="custom">Tanggal tertentu</option>
        </select>
      </div>
      <div className="b-period-date">
        <b>{to}</b>
        <span aria-live="polite">
          {loading ? "Memuat data…" : "Data aktual dari aplikasi"}
        </span>
      </div>
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
      <p className="b-refresh-stamp" aria-live="polite">
        {refreshedAt
          ? `Terakhir diperbarui: ${formatRefreshTime(refreshedAt)}`
          : "Data belum diperbarui."}
      </p>
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
  const points = reportPoints(recap, history);
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
          <h2>Grafik omzet sesuai periode</h2>
        </div>
        <div className="b-sales-chart">
          {points.map((point) => (
            <div className="b-sales-bar" key={point.key} title={`${point.label}: ${money(point.income)}`}>
              <strong
                style={{
                  height: `${Math.max(point.income ? 12 : 4, Math.round((point.income / max) * 120))}px`,
                }}
              />
              {point.income > 0 && <small>{money(point.income)}</small>}
              <em>
                {point.label}
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
  const [periodFrom, setPeriodFrom] = useState(daysAgo(today, 6)),
    [periodTo, setPeriodTo] = useState(today),
    [periodPreset, setPeriodPreset] = useState("7d");
  const [auth, setAuth] = useState<Auth | null | undefined>(undefined),
    [users, setUsers] = useState<LoginUser[]>([]),
    [usersBusy, setUsersBusy] = useState(true),
    [loginUserId, setLoginUserId] = useState("owner-demo"),
    [role, setRole] = useState<Mode>("OWNER"),
    [pin, setPin] = useState(""),
    [authBusy, setAuthBusy] = useState(false),
    [settingsUserId, setSettingsUserId] = useState("owner-demo"),
    [settingsPin, setSettingsPin] = useState(""),
    [settingsPinConfirm, setSettingsPinConfirm] = useState(""),
    [settingsBusy, setSettingsBusy] = useState(false),
    [view, setView] = useState<View>("home"),
    [activeJobs, setActiveJobs] = useState<Job[]>([]),
    [recap, setRecap] = useState<Recap | null>(null),
    [history, setHistory] = useState<Job[]>([]),
    [expenses, setExpenses] = useState<Expense[]>([]),
    [job, setJob] = useState(blankJob),
    [exp, setExp] = useState(blankExp),
    [detail, setDetail] = useState<Job | null>(null),
    [busy, setBusy] = useState(false),
    [detailBusy, setDetailBusy] = useState(false),
    [mediaUploadMessage, setMediaUploadMessage] = useState(""),
    [paymentOpen, setPaymentOpen] = useState(false),
    [periodLoading, setPeriodLoading] = useState(false),
    [lastRefreshed, setLastRefreshed] = useState<string | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [menuOpen, setMenuOpen] = useState(false);
  const loadVersion = useRef(0);
  const activeJobsRequest = useRef(false);
  const reportCache = useRef(new Map<string, { recap?: Recap; history?: Job[]; expenses?: Expense[]; refreshedAt: string }>());
  const detailLoadVersion = useRef(0);
  const createJobRequest = useRef(false);
  const createJobKey = useRef<string | null>(null);
  const owner = auth?.role === "OWNER";
  const manageableUsers = users.length
    ? users
    : [
        { user_id: "owner-demo", display_name: "Owner Demo", role: "OWNER" as Mode },
        { user_id: "operator-demo", display_name: "Operator Demo", role: "OPERATOR" as Mode },
      ];
  const loginUser =
    manageableUsers.find((user) => user.user_id === loginUserId) || manageableUsers[0];
  const notify = (e = "", m = "") => {
    setError(e);
    setMessage(m);
  };
  async function load(from = periodFrom, to = periodTo) {
    if (!auth) return;
    const version = ++loadVersion.current;
    const read = async (path: string, attempts = 2) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          const response = await fetch(path, {
            cache: "no-store",
            signal: AbortSignal.timeout(65000),
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) return result;
          }
        } catch {}
        if (attempt + 1 < attempts)
          await new Promise((resolve) => setTimeout(resolve, 600));
      }
      return { success: false };
    };
    if (!owner) {
      setPeriodLoading(false);
      if (!activeJobsRequest.current && ["home", "jobs", "new"].includes(view)) {
        activeJobsRequest.current = true;
        void (async () => {
          const result = await read("/api/jobs");
          activeJobsRequest.current = false;
          if (result.success && result.data) {
            setActiveJobs(result.data);
            setLastRefreshed(new Date().toISOString());
          }
        })();
      }
      return;
    }
    setError("");
    const qs = `?date_from=${encodeURIComponent(from)}&date_to=${encodeURIComponent(to)}`;
    const cacheKey = `${from}:${to}`;
    const needsHistory = ["home", "history", "sales", "report"].includes(view);
    const needsExpenses = view === "expense";
    const needsRecap = ["home", "sales", "report"].includes(view);
    const cached = reportCache.current.get(cacheKey);
    const hasCachedData = Boolean(
      cached &&
        (!needsRecap || cached.recap) &&
        (!needsHistory || cached.history) &&
        (!needsExpenses || cached.expenses),
    );
    if (cached?.recap) setRecap(cached.recap);
    if (cached?.history) setHistory(cached.history);
    if (cached?.expenses) setExpenses(cached.expenses);
    if (needsRecap && !cached?.recap) setRecap(null);
    if (needsHistory && !cached?.history) setHistory([]);
    if (needsExpenses && !cached?.expenses) setExpenses([]);
    if (hasCachedData && cached) setLastRefreshed(cached.refreshedAt);
    if (!hasCachedData) setLastRefreshed(null);
    setPeriodLoading(!hasCachedData);
    let r = { success: true, data: undefined as Recap | undefined };
    let h = { success: true, data: undefined as Job[] | undefined };
    let activeIncluded = false;
    if (needsRecap && needsHistory) {
      const report = await read(`/api/report${qs}`);
      r = { success: report.success, data: report.data?.recap };
      h = { success: report.success, data: report.data?.history };
      if (report.success && report.data?.active_jobs) {
        setActiveJobs(report.data.active_jobs);
        activeIncluded = true;
      }
    } else {
      if (needsRecap) r = await read(`/api/recap${qs}`);
      if (version !== loadVersion.current) return;
      if (needsHistory) h = await read(`/api/history${qs}`);
    }
    if (version !== loadVersion.current) return;
    if (r.success && r.data) setRecap(r.data);
    if (h.success && h.data) setHistory(h.data || []);
    const e = needsExpenses ? await read(`/api/expenses${qs}`) : { success: true, data: undefined };
    if (version !== loadVersion.current) return;
    if (e.success && e.data) setExpenses(e.data || []);
    if (["home", "jobs", "new"].includes(view) && !activeIncluded && !activeJobsRequest.current) {
      activeJobsRequest.current = true;
      void read("/api/jobs").then((jobs) => {
        activeJobsRequest.current = false;
        if (jobs.success && jobs.data) setActiveJobs(jobs.data);
      });
    }
    if (version === loadVersion.current) {
      setPeriodLoading(false);
      if (r.success && h.success && e.success) {
        const refreshedAt = new Date().toISOString();
        reportCache.current.set(cacheKey, {
          recap: r.data || cached?.recap,
          history: h.data || cached?.history,
          expenses: e.data || cached?.expenses,
          refreshedAt,
        });
        setLastRefreshed(refreshedAt);
      } else if (!hasCachedData) {
        setError("Data periode belum termuat lengkap. Tekan Refresh untuk mencoba lagi.");
      }
    }
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
    if (["7d", "14d", "30d", "90d"].includes(value)) {
      const from = daysAgo(end, Number(value.slice(0, -1)) - 1);
      setPeriodFrom(from);
      setPeriodTo(end);
      load(from, end);
      return;
    }
    if (value === "today") {
      setPeriodFrom(end);
      setPeriodTo(end);
      load(end, end);
      return;
    }
    if (value === "all") {
      const from = "1900-01-01";
      setPeriodFrom(from);
      setPeriodTo(end);
      load(from, end);
    }
  }
  useEffect(() => {
    let active = true;
    // Owner/Operator bawaan tetap dapat dipilih saat Apps Script sedang cold start.
    setUsersBusy(false);
    (async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await fetch("/api/auth/users", {
            cache: "no-store",
            signal: AbortSignal.timeout(30000),
          });
          const result = await response.json();
          if (response.ok && result.success && result.data?.length) {
            setUsers(result.data);
            setLoginUserId((current) =>
              result.data.some((user: LoginUser) => user.user_id === current)
                ? current
                : result.data[0].user_id,
            );
            setUsersBusy(false);
            return;
          }
        } catch {}
        if (attempt < 2)
          await new Promise((resolve) => setTimeout(resolve, 900));
      }
      if (active) {
        setUsersBusy(false);
        setError("Daftar pengguna belum termuat. Silakan muat ulang halaman.");
      }
    })();
    fetch("/api/auth/session", {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    })
      .then(async (x) => (x.ok ? x.json() : { success: false }))
      .then((r) => {
        if (r.success) {
          setAuth(r.data);
          setRole(r.data.role);
        } else setAuth(null);
      })
      .catch(() => setAuth(null));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (auth) load();
  }, [auth, view]);
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
  function logout() {
    setAuth(null);
    setView("home");
    setPin("");
    notify();
    void fetch("/api/auth/logout", { method: "POST", keepalive: true }).catch(() => {});
  }
  async function updatePin(e: FormEvent) {
    e.preventDefault();
    if (settingsBusy) return;
    if (!/^\d{4,8}$/.test(settingsPin)) {
      notify("PIN baru harus berisi 4–8 angka.");
      return;
    }
    if (settingsPin !== settingsPinConfirm) {
      notify("Konfirmasi PIN belum sama.");
      return;
    }
    setSettingsBusy(true);
    notify();
    try {
      const response = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: settingsUserId, pin: settingsPin }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        notify(result.message || "PIN gagal diperbarui.");
        return;
      }
      setSettingsPin("");
      setSettingsPinConfirm("");
      notify("", "PIN berhasil diperbarui. PIN lama tidak disimpan di aplikasi.");
    } catch {
      notify("PIN gagal terhubung ke backend. Coba lagi.");
    } finally {
      setSettingsBusy(false);
    }
  }
  function press(n: string) {
    if (n === "C") return setPin("");
    if (n === "⌫") return setPin(pin.slice(0, -1));
    if (pin.length < 8) setPin(pin + n);
  }
  async function createJob(e: FormEvent) {
    e.preventDefault();
    if (busy || createJobRequest.current) return;
    createJobRequest.current = true;
    setBusy(true);
    notify();
    try {
      const idempotencyKey = createJobKey.current || (createJobKey.current = key());
      const r = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...job,
          work_description: `${job.work_type}: ${job.work_description}`.trim(),
          idempotency_key: idempotencyKey,
        }),
      }).then((x) => x.json());
      if (!r.success) {
        setError(r.message);
        return;
      }
      createJobKey.current = null;
      setActiveJobs((current) => [
        r.data,
        ...current.filter((item) => item.job_id !== r.data.job_id),
      ]);
      setJob(blankJob);
      setView("jobs");
      notify("", "Job baru berhasil disimpan.");
    } catch {
      setError(
        "Job belum dapat dipastikan tersimpan. Periksa daftar Job sebelum mengirim ulang.",
      );
    } finally {
      setBusy(false);
      createJobRequest.current = false;
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
    const version = ++detailLoadVersion.current;
    const summary = activeJobs.find((job) => job.job_id === id);
    setMediaUploadMessage("");
    setPaymentOpen(false);
    if (summary) setDetail({ ...summary, media: summary.media || [] });
    try {
      const r = await fetch(`/api/jobs/${encodeURIComponent(id)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }).then((x) => x.json());
      if (r.success && version === detailLoadVersion.current) setDetail(r.data);
      else if (!summary && version === detailLoadVersion.current) setError(r.message || "Detail Job belum dapat dimuat.");
    } catch {
      if (!summary && version === detailLoadVersion.current) setError("Detail Job belum dapat dimuat.");
    }
  }
  function dismissDetail() {
    detailLoadVersion.current += 1;
    setMediaUploadMessage("");
    setPaymentOpen(false);
    setDetail(null);
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
      dismissDetail();
      await load();
      notify("", "Payment berhasil dicatat dan Job CLOSED.");
    } finally {
      setDetailBusy(false);
    }
  }
  async function uploadMedia(file: File, category: "BEFORE" | "PROCESS" | "AFTER") {
    if (!detail || detailBusy) return;
    setMediaUploadMessage("");
    setDetailBusy(true);
    try {
      const encoded = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(file);
      });
      const r = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: detail.job_id,
          category,
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
      const label = category === "PROCESS" ? "Process" : category[0] + category.slice(1).toLowerCase();
      setMediaUploadMessage(`${label}: ${file.name} berhasil diunggah dan tersimpan.`);
      notify("", `Dokumentasi ${category.toLowerCase()} berhasil diunggah.`);
    } catch {
      setError(
        "Upload media gagal. Job tetap aman dan file dapat dicoba lagi.",
      );
    } finally {
      setDetailBusy(false);
    }
  }
  function chooseMedia(
    e: ChangeEvent<HTMLInputElement>,
    category: "BEFORE" | "PROCESS" | "AFTER",
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void uploadMedia(file, category);
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
    const report: MonthlyReport = {
      dateFrom: recap.date_from,
      dateTo: recap.date_to,
      income: recap.snapshot.total_income,
      expense: recap.snapshot.total_expense,
      difference: recap.snapshot.difference,
      closedJobCount: recap.snapshot.closed_job_count,
      rows: history.map((job) => ({
        closedAt: job.closed_at,
        jobId: job.job_id,
        motorcycleModel: job.motorcycle_model,
        workDescription: job.work_description,
        status: job.status,
        paymentAmount: job.payment?.amount || 0,
        agreedPrice: job.agreed_price,
      })),
    };
    let blob: Blob;
    if (kind === "xls") {
      blob = new Blob([buildMonthlyReportExcel(report)], { type: "application/vnd.ms-excel" });
    } else {
      blob = new Blob([buildMonthlyReportPdf(report)], { type: "application/pdf" });
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
            <p>Pilih pengguna dan masukkan PIN</p>
            <label className="b-login-user">
              <span>Pengguna aktif</span>
              <select
                aria-label="Pilih pengguna"
                value={loginUser.user_id}
                disabled={usersBusy}
                onChange={(event) => {
                  const selected = manageableUsers.find((user) => user.user_id === event.target.value);
                  if (selected) {
                    setLoginUserId(selected.user_id);
                    setRole(selected.role);
                  }
                }}
              >
                {manageableUsers.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.display_name} · {user.role === "OWNER" ? "Owner" : "Operator"}
                  </option>
                ))}
              </select>
            </label>
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
                disabled={authBusy || usersBusy || !loginUser || pin.length < 4}
              >
                {authBusy
                  ? "MEMERIKSA…"
                  : usersBusy
                    ? "MEMUAT AKUN…"
                    : "↪ MASUK"}
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
  const active = activeJobs.filter(
    (j) => !owner || (j.created_at.slice(0, 10) >= periodFrom && j.created_at.slice(0, 10) <= periodTo),
  );
  const period = recap ? `${recap.date_from} s/d ${recap.date_to}` : "Memuat…";
  return (
    <main className="b-app">
      <header className="b-top">
        <div className="b-top-left">
          <button
            className="b-header-menu"
            aria-label={owner ? "Buka menu owner" : "Buka daftar job"}
            onClick={() => (owner ? setMenuOpen(true) : setView("jobs"))}
          >
            ☰
          </button>
          <div className="b-header-title">
            <strong>{owner ? "OWNER" : "OPERATOR"}</strong>
            <small>
              {owner ? "Ringkasan operasional" : "Jalankan pekerjaan hari ini"}
            </small>
          </div>
        </div>
        <div className="b-user-chip">
          <span className="b-user-dot">{owner ? "O" : "P"}</span>
          <span>{auth.display_name}</span>
          <button
            aria-label="Menu akun"
            onClick={() => (owner ? setMenuOpen(true) : logout())}
          >
            {owner ? "⌄" : "↪"}
          </button>
        </div>
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
        {owner && view !== "home" && (
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
            loading={periodLoading}
            refreshedAt={lastRefreshed}
          />
        )}
        {view === "home" && owner && (
          <>
            <section className="b-card b-welcome">
              <div>
                <h2>Selamat datang, Owner!</h2>
                <p>Pantau pekerjaan dan uang masuk hari ini.</p>
              </div>
              <img src="/motokraf-site-ico.webp" alt="Motokraf" />
            </section>
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
              loading={periodLoading}
              refreshedAt={lastRefreshed}
            />
            <div className="b-section-title">
              <h2>RINGKASAN HARI INI</h2>
              <button className="b-refresh-link" onClick={() => load()}>
                Refresh
              </button>
            </div>
            <div className="b-metrics">
              <div>
                <span className="b-metric-icon">🔧</span>
                <small>Job aktif</small>
                <b>{active.length}</b>
              </div>
              <div>
                <span className="b-metric-icon">💵</span>
                <small>Pemasukan periode</small>
                <b>{money(recap?.snapshot.total_income || 0)}</b>
              </div>
              <div>
                <span className="b-metric-icon">💵</span>
                <small>Pengeluaran periode</small>
                <b>{money(recap?.snapshot.total_expense || 0)}</b>
              </div>
              <div>
                <span className="b-metric-icon">🔧</span>
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
            <Chart recap={recap} history={history} loading={periodLoading} />
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
            <form onSubmit={updatePin}>
              <label>
                Pengguna
                <select
                  value={settingsUserId}
                  onChange={(e) => setSettingsUserId(e.target.value)}
                >
                  {manageableUsers.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.display_name} · {user.role}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                PIN baru
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{4,8}"
                  minLength={4}
                  maxLength={8}
                  type="password"
                  value={settingsPin}
                  onChange={(e) => setSettingsPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="4–8 angka"
                />
              </label>
              <label>
                Konfirmasi PIN baru
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{4,8}"
                  minLength={4}
                  maxLength={8}
                  type="password"
                  value={settingsPinConfirm}
                  onChange={(e) => setSettingsPinConfirm(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ulangi PIN baru"
                />
              </label>
              <small className="b-pin-help">
                PIN lama dan hash tidak pernah ditampilkan. Perubahan berlaku untuk login berikutnya.
              </small>
              <button className="b-primary" disabled={settingsBusy}>
                {settingsBusy ? "Menyimpan PIN…" : "Simpan PIN baru"}
              </button>
            </form>
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
      <nav className={`b-bottom ${owner ? "b-owner-bottom" : "b-operator-bottom"}`}>
        {owner ? (
          <>
            <button
              className={view === "home" ? "active" : ""}
              onClick={() => setView("home")}
            >
              ⌂<small>Ringkasan</small>
            </button>
            <button
              className={view === "jobs" ? "active" : ""}
              onClick={() => setView("jobs")}
            >
              ▣<small>Job</small>
            </button>
            <button
              className={view === "expense" ? "active" : ""}
              onClick={() => setView("expense")}
            >
              🛒<small>Belanja</small>
            </button>
            <button
              className={view === "history" ? "active" : ""}
              onClick={() => setView("history")}
            >
              ▤<small>Riwayat</small>
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
        <div
          className={owner ? "b-modal" : "b-operator-detail"}
          onClick={() => owner && dismissDetail()}
        >
          <article onClick={(e) => e.stopPropagation()}>
            <button className="b-close" onClick={dismissDetail}>
              {owner ? "Tutup" : "← Kembali"}
            </button>
            <p className="b-eyebrow">JOB DETAIL</p>
            <h2>{detail.motorcycle_model}</h2>
            {owner ? (
              <>
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
              </>
            ) : (
              <>
                <p className="b-detail-work">{detail.work_description || "Lainnya"}</p>
                <div className="b-detail-grid">
                  <div><small>Status</small><strong>{detail.status}</strong></div>
                  <div><small>Harga deal</small><strong>{money(Number(detail.agreed_price))}</strong></div>
                  <div><small>Pelanggan</small><strong>{detail.customer_name || "—"}</strong></div>
                  <div><small>Tanggal</small><strong>{formatPeriodDate(detail.created_at)}</strong></div>
                </div>
              </>
            )}
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
                <section className="b-work-media" aria-label="Dokumentasi pekerjaan">
                  <h3>Dokumentasi pekerjaan</h3>
                  <p>Pilih tahap pekerjaan, lalu ambil foto atau video.</p>
                  {mediaUploadMessage && (
                    <p className="b-media-upload-success" role="status" aria-live="polite">
                      ✓ {mediaUploadMessage}
                    </p>
                  )}
                  <div className="b-media-slots">
                    {(["BEFORE", "PROCESS", "AFTER"] as const).map((category) => {
                      const saved = detail.media?.filter((item) => item.category === category).length || 0;
                      return (
                        <label className="b-media-slot" key={category}>
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/webm,video/quicktime"
                            capture="environment"
                            disabled={detailBusy}
                            onChange={(e) => chooseMedia(e, category)}
                          />
                          <span>＋</span>
                          <strong>{category === "PROCESS" ? "Process" : category[0] + category.slice(1).toLowerCase()}</strong>
                          <small>{detailBusy ? "Mengunggah…" : saved ? `${saved} media tersimpan` : "Tambah media"}</small>
                        </label>
                      );
                    })}
                  </div>
                </section>
                {!owner && !paymentOpen && (
                  <button className="b-primary b-close-job" onClick={() => setPaymentOpen(true)}>
                    Catat Payment & Close Job
                  </button>
                )}
                {(owner || paymentOpen) && (
                  <form onSubmit={closeJob} className="b-payment-form">
                    <h3>Catat Pembayaran & Close</h3>
                    <label>
                      Nominal
                      <input required type="number" name="amount" defaultValue={detail.agreed_price} />
                    </label>
                    <label>
                      Metode
                      <select name="payment_method">
                        <option>CASH</option><option>TRANSFER</option><option>QRIS</option><option>OTHER</option>
                      </select>
                    </label>
                    <button className="b-primary" disabled={detailBusy}>
                      {detailBusy ? "Memproses…" : "Simpan Payment & Close"}
                    </button>
                  </form>
                )}
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

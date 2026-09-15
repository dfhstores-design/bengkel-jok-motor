import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ts from "../frontend/node_modules/typescript/lib/typescript.js";

function loadExporter() {
  const source = readFileSync(new URL("../frontend/lib/monthly-report-export.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  new Function("exports", "module", compiled.outputText)(module.exports, module);
  return module.exports;
}

const sample = {
  dateFrom: "2026-09-01",
  dateTo: "2026-09-30",
  income: 850000,
  expense: 215000,
  difference: 635000,
  closedJobCount: 3,
  rows: Array.from({ length: 50 }, (_, index) => ({
    closedAt: "2026-09-15T08:00:00.000Z",
    jobId: `JOB-20260915-${String(index + 1).padStart(3, "0")}`,
    motorcycleModel: "Honda Beat",
    workDescription: "Ganti kulit jok",
    status: "CLOSED",
    paymentAmount: 17000,
    agreedPrice: 17000,
  })),
};

test("monthly PDF is structurally valid and contains the required summary", () => {
  const { buildMonthlyReportPdf } = loadExporter();
  const path = join(tmpdir(), `motokraf-monthly-${process.pid}.pdf`);
  try {
    const pdf = Buffer.from(buildMonthlyReportPdf(sample));
    assert.match(pdf.toString("latin1"), /%PDF-1.4/);
    assert.match(pdf.toString("latin1"), /SUMMARY BULANAN/);
    assert.match(pdf.toString("latin1"), /Pendapatan/);
    assert.match(pdf.toString("latin1"), /Pengeluaran/);
    assert.match(pdf.toString("latin1"), /Selisih hasil usaha/);
    writeFileSync(path, pdf);
    execFileSync("qpdf", ["--check", path], { stdio: "pipe" });
  } finally {
    rmSync(path, { force: true });
  }
});

test("monthly Excel includes the same monthly summary and transaction detail", () => {
  const { buildMonthlyReportExcel } = loadExporter();
  const excel = buildMonthlyReportExcel(sample);
  assert.match(excel, /SUMMARY BULANAN/);
  assert.match(excel, /Pendapatan \(Payment\)/);
  assert.match(excel, /Pengeluaran/);
  assert.match(excel, /Selisih hasil usaha/);
  assert.match(excel, /RINCIAN JOB CLOSED/);
  assert.match(excel, /JOB-20260915-001/);
});

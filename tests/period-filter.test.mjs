import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

function backendWith(records) {
  const context = vm.createContext({
    console,
    Utilities: {
      formatDate(value) {
        return new Date(value).toISOString().slice(0, 10);
      },
    },
  });
  vm.runInContext(readFileSync(new URL("../apps-script/Code.gs", import.meta.url), "utf8"), context);
  context.allPaymentRecords_ = () => records.payments;
  context.allExpenseRecords_ = () => records.expenses;
  context.allJobRecords_ = () => records.jobs.map((job) => ({ ...job }));
  context.logEvent_ = () => {};
  context.ok_ = (data) => ({ success: true, data });
  return context;
}

test("financial period follows Payment date, while an unpaid closed Job remains an inconsistency", () => {
  const backend = backendWith({
    jobs: [
      { job_id: "JOB-1", status: "CLOSED", closed_at: "2026-09-01T10:00:00Z" },
      { job_id: "JOB-2", status: "CLOSED", closed_at: "2026-09-03T10:00:00Z" },
    ],
    payments: [{ payment_id: "PAY-1", job_id: "JOB-1", amount: 125000, created_at: "2026-09-03T11:00:00Z" }],
    expenses: [],
  });
  const onPaymentDate = backend.financialSnapshot_("2026-09-03", "2026-09-03");
  assert.equal(onPaymentDate.total_income, 125000);
  assert.equal(onPaymentDate.closed_job_count, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(onPaymentDate.inconsistencies)), [{ job_id: "JOB-2", issue: "CLOSED_WITHOUT_PAYMENT" }]);
  const onClosedDate = backend.financialSnapshot_("2026-09-01", "2026-09-01");
  assert.equal(onClosedDate.total_income, 0);
  assert.equal(onClosedDate.closed_job_count, 0);
});

test("closed-job list uses linked Payment date so list and income period agree", () => {
  const backend = backendWith({
    jobs: [{ job_id: "JOB-1", status: "CLOSED", closed_at: "2026-09-01T10:00:00Z", motorcycle_model: "Beat", work_description: "Ganti kulit" }],
    payments: [{ payment_id: "PAY-1", job_id: "JOB-1", amount: 125000, created_at: "2026-09-03T11:00:00Z" }],
    expenses: [],
  });
  const paymentDay = backend.listClosedJobs_({ date_from: "2026-09-03", date_to: "2026-09-03" });
  assert.equal(paymentDay.success, true);
  assert.equal(paymentDay.data.length, 1);
  const closedDay = backend.listClosedJobs_({ date_from: "2026-09-01", date_to: "2026-09-01" });
  assert.equal(closedDay.data.length, 0);
});

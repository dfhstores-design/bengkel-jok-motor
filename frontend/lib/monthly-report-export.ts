export type MonthlyReportRow = {
  closedAt: string;
  jobId: string;
  motorcycleModel: string;
  workDescription: string;
  status: string;
  paymentAmount: number;
  agreedPrice: number;
};

export type MonthlyReport = {
  dateFrom: string;
  dateTo: string;
  income: number;
  expense: number;
  difference: number;
  closedJobCount: number;
  rows: MonthlyReportRow[];
};

const encoder = new TextEncoder();
const reportMoney = (value: number) => `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`;
const xml = (value: string | number) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
const pdfText = (value: string | number) => String(value)
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^\x20-\x7e]/g, "?")
  .replace(/[()\\]/g, (character) => `\\${character}`);

function summaryLines(report: MonthlyReport) {
  return [
    "LAPORAN BULANAN MOTOKRAF",
    `Periode: ${report.dateFrom} s/d ${report.dateTo}`,
    "",
    "SUMMARY BULANAN",
    `Pendapatan (Payment): ${reportMoney(report.income)}`,
    `Pengeluaran: ${reportMoney(report.expense)}`,
    `Selisih hasil usaha: ${reportMoney(report.difference)}`,
    `Job CLOSED: ${report.closedJobCount}`,
    "",
    "RINCIAN JOB CLOSED",
  ];
}

export function buildMonthlyReportPdf(report: MonthlyReport): ArrayBuffer {
  const detailLines = report.rows.length
    ? report.rows.map((row) => `${row.closedAt.slice(0, 10)} | ${row.jobId} | ${row.motorcycleModel} | ${row.status} | ${reportMoney(row.paymentAmount)}`)
    : ["Tidak ada Job CLOSED pada periode ini."];
  const lines = [...summaryLines(report), ...detailLines].map(pdfText);
  const linesPerPage = 43;
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / linesPerPage)) }, (_, index) => lines.slice(index * linesPerPage, (index + 1) * linesPerPage));
  const contentStreams = pages.map((page) => {
    const commands = ["BT", "/F1 10 Tf", "50 790 Td", "14 TL"];
    page.forEach((line, index) => {
      if (index) commands.push("T*");
      commands.push(`(${line}) Tj`);
    });
    commands.push("ET");
    return commands.join("\n");
  });
  const pageIds = pages.map((_, index) => 4 + index * 2);
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  contentStreams.forEach((stream, index) => {
    const pageId = pageIds[index];
    const contentId = pageId + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}\nendstream`);
  });
  const parts: Uint8Array[] = [encoder.encode("%PDF-1.4\n")];
  const offsets = [0];
  let offset = parts[0].length;
  objects.forEach((object, index) => {
    offsets.push(offset);
    const bytes = encoder.encode(`${index + 1} 0 obj\n${object}\nendobj\n`);
    parts.push(bytes);
    offset += bytes.length;
  });
  const xref = offset;
  const trailer = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((value) => `${String(value).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  parts.push(encoder.encode(trailer));
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let cursor = 0;
  parts.forEach((part) => { output.set(part, cursor); cursor += part.length; });
  return output.buffer as ArrayBuffer;
}

export function buildMonthlyReportExcel(report: MonthlyReport): string {
  const summaryRows = [
    ["SUMMARY BULANAN", ""],
    ["Periode", `${report.dateFrom} s/d ${report.dateTo}`],
    ["Pendapatan (Payment)", reportMoney(report.income)],
    ["Pengeluaran", reportMoney(report.expense)],
    ["Selisih hasil usaha", reportMoney(report.difference)],
    ["Job CLOSED", report.closedJobCount],
  ];
  const detailRows = report.rows.map((row) => [row.closedAt.slice(0, 10), row.jobId, row.motorcycleModel, row.workDescription, row.status, reportMoney(row.paymentAmount), reportMoney(row.agreedPrice)]);
  const table = (rows: Array<Array<string | number>>, header = false) => rows.map((row) => `<tr>${row.map((value) => header ? `<th>${xml(value)}</th>` : `<td>${xml(value)}</td>`).join("")}</tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><h1>LAPORAN BULANAN MOTOKRAF</h1><table border="1">${table(summaryRows)}</table><br><h2>RINCIAN JOB CLOSED</h2><table border="1">${table([["Tanggal", "Job ID", "Model", "Pekerjaan", "Status", "Payment", "Harga deal"]], true)}${table(detailRows)}</table></body></html>`;
}

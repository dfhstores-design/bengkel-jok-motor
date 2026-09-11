import concurrent.futures
import hashlib
import json
import urllib.parse
import urllib.request
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

import openpyxl


BASE = "https://aplikasi-bengkel-sprint0.vercel.app"
BACKUP = r"D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\backups\BACKUP_PRODUCTION_MVP_DATA_STORE_2026-09-11_2355.xlsx"


def get(path):
    with urllib.request.urlopen(BASE + path, timeout=30) as response:
        return json.load(response)


def detail(job):
    return get("/api/jobs/" + urllib.parse.quote(job["job_id"], safe=""))["data"]


def ids(rows, key):
    return [str(row[key]) for row in rows if isinstance(row, dict) and row.get(key) not in (None, "")]


def summary(backup_rows, live_rows, key):
    before = ids(backup_rows, key)
    after = ids(live_rows, key)
    headers = sorted(set().union(*(row.keys() for row in backup_rows)))

    def normalized(row):
        values = {}
        for header in headers:
            value = row.get(header, "")
            if isinstance(value, (datetime, date)):
                value = value.strftime("%Y-%m-%d") if header.endswith("_date") else value.isoformat()
            elif value is None:
                value = ""
            elif header in {"agreed_price", "amount", "total_amount", "unit_price", "quantity"}:
                try:
                    value = format(Decimal(str(value).replace(",", "")), "f")
                except (InvalidOperation, ValueError):
                    value = str(value)
            values[header] = str(value)
        return values

    before_rows = {str(row[key]): normalized(row) for row in backup_rows if row.get(key) not in (None, "")}
    after_rows = {str(row[key]): normalized(row) for row in live_rows if row.get(key) not in (None, "")}
    before_fingerprint = hashlib.sha256(json.dumps(before_rows, sort_keys=True).encode()).hexdigest()
    after_fingerprint = hashlib.sha256(json.dumps(after_rows, sort_keys=True).encode()).hexdigest()
    differing_rows = []
    for row_id in sorted(set(before_rows) & set(after_rows)):
        fields = [header for header in headers if before_rows[row_id].get(header) != after_rows[row_id].get(header)]
        if fields:
            differing_rows.append({"id": row_id, "fields": fields})
    business_differences = []
    numeric_fields = {"agreed_price", "amount", "total_amount", "unit_price", "quantity"}
    for row_id in sorted(set(before_rows) & set(after_rows)):
        fields = []
        for header in headers:
            left, right = before_rows[row_id].get(header, ""), after_rows[row_id].get(header, "")
            if header in numeric_fields:
                try:
                    if Decimal(left or "0") != Decimal(right or "0"):
                        fields.append(header)
                except InvalidOperation:
                    fields.append(header)
            elif header.endswith("_date"):
                if left[:10] != right[:10]:
                    fields.append(header)
            elif left != right:
                fields.append(header)
        if fields:
            business_differences.append({"id": row_id, "fields": fields})
    return {
        "backup_count": len(before),
        "live_count": len(after),
        "backup_duplicates": len(before) - len(set(before)),
        "live_duplicates": len(after) - len(set(after)),
        "same_id_set": set(before) == set(after),
        "same_row_content": before_rows == after_rows,
        "same_business_content": not business_differences,
        "differing_row_count": len(differing_rows),
        "differing_fields": sorted(set(field for row in differing_rows for field in row["fields"])),
        "business_differing_row_count": len(business_differences),
        "business_differing_fields": sorted(set(field for row in business_differences for field in row["fields"])),
        "missing_live": len(set(before) - set(after)),
        "extra_live": len(set(after) - set(before)),
        "backup_id_sha256": hashlib.sha256("\n".join(sorted(before)).encode()).hexdigest(),
        "live_id_sha256": hashlib.sha256("\n".join(sorted(after)).encode()).hexdigest(),
        "backup_row_sha256": before_fingerprint,
        "live_row_sha256": after_fingerprint,
    }


def main():
    history = get("/api/history")["data"]
    expenses = get("/api/expenses")["data"]
    dashboard = get("/api/dashboard")["data"]
    recap = get("/api/recap")["data"]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        details = list(pool.map(detail, history))

    workbook = openpyxl.load_workbook(BACKUP, read_only=True, data_only=True)
    backup = {}
    for name in ("Jobs", "Payments", "Expenses", "Media"):
        rows = list(workbook[name].iter_rows(values_only=True))
        header = [str(value).strip() if value is not None else "" for value in rows[0]]
        backup[name] = [dict(zip(header, row)) for row in rows[1:] if any(value not in (None, "") for value in row)]

    payments = [row["payment"] for row in details if row.get("payment")]
    media = [item for row in details for item in (row.get("media") or [])]
    job_ids = set(ids(history, "job_id"))
    result = {
        "Jobs": summary(backup["Jobs"], history, "job_id"),
        "Payments": summary(backup["Payments"], payments, "payment_id"),
        "Expenses": summary(backup["Expenses"], expenses, "expense_id"),
        "Media": summary(backup["Media"], media, "media_id"),
        "relationships": {
            "details_for_all_history_jobs": len(details) == len(history),
            "payment_job_mismatches": sum(str(row.get("job_id")) not in job_ids for row in payments),
            "media_job_mismatches": sum(str(row.get("owner_id")) not in job_ids for row in media),
        },
        "dashboard": dashboard,
        "recap": recap,
    }
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

# Sprint 0 Apps Script Setup

Set Script Properties exactly as follows:

- `ENVIRONMENT=development`
- `SPREADSHEET_ID=<INJECT_AT_RUNTIME_ONLY>`
- `MEDIA_ROOT_FOLDER_ID=<INJECT_AT_RUNTIME_ONLY>`
- `MEDIA_JOBS_FOLDER_ID=<INJECT_AT_RUNTIME_ONLY>`
- `MEDIA_EXPENSES_FOLDER_ID=<INJECT_AT_RUNTIME_ONLY>`
- `MEDIA_PAYMENTS_FOLDER_ID=<INJECT_AT_RUNTIME_ONLY>`
- `TIMEZONE=Asia/Jakarta`

Deploy as Web App, then set the Vercel/Next.js environment variable `APPS_SCRIPT_API_URL` to the `/exec` URL.

Only `healthCheck` is routed in Sprint 0. Do not add Job/Payment/Expense/Media business endpoints until their sprint.

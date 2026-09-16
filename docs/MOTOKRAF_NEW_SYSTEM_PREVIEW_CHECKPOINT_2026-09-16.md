# Motokraf New System — Preview Checkpoint (2026-09-16)

## Scope

This checkpoint covers the isolated new-system frontend candidate only. The
legacy Sheet, Apps Script, application URL, and Vercel project remain
unchanged.

## Verified

| Item | Status |
| --- | --- |
| New Sheet baseline | PASS — the copied real-tenant workbook was previously backed up and validated before this stage. |
| New backend | PASS — active version 6 points to the new Sheet only; initial Owner and Operator accounts exist as hashes. |
| New Vercel project | PASS — `motokraf` is a separate Vercel project. |
| Server-side backend binding | PASS — the new backend URL exists only in Vercel Preview as encrypted server-side configuration. |
| Candidate URL | PASS — https://motokraf-jf031x341-dfhstores-projects.vercel.app is READY as Preview. |
| Login discovery | PASS — browser verification shows `Owner · Owner` and `Operator · Operator`. |
| Browser health | PASS — no console warning or error was observed on the login page. |
| PIN secrecy | PASS — no PIN was entered, stored, logged, or copied during this stage. |
| Legacy system | UNCHANGED — no legacy deployment, source, Sheet cell, schema, or backend route was changed. |

## Deployment lineage

The first deployment of the new project was 404 because Vercel created the
project with its `Other` framework preset. The project was corrected to
Next.js and the Preview candidate above was rebuilt successfully. The 404
deployment remains Vercel history only; it has no production backend setting
and is not a release candidate.

## Open gates

1. Owner-controlled PIN entry is required to exercise real login, logout,
   session refresh, role denial, and the approved operational flows.
2. The new Sheet remains link-readable. Its production sharing policy needs a
   separate explicit owner decision before public release.
3. The final public address remains a release choice: a Motokraf subdomain or
   `motokraf.vercel.app`. No promotion to either has been performed.

## Rollback

Stop using the Preview URL. The legacy URL and legacy data path continue to
operate independently; no data restoration is required for this checkpoint.

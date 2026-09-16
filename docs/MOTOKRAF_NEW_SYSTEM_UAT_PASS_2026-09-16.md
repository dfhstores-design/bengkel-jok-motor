# Motokraf New System — UAT Pass (2026-09-16)

The account holder tested the isolated Motokraf Preview and reported **PASS**.
The test was performed using the Owner and Operator accounts without sharing or
recording either PIN.

## Evidence chain

- Candidate frontend: `motokraf-jf031x341-dfhstores-projects.vercel.app`
- Backend: isolated new Apps Script, active version 6
- Data store: separate `Data Penjualan Motokraf` Sheet copied from real tenant
  data and validated before account provisioning
- Frontend commit: `68ca7a1`
- Legacy application, legacy backend, and legacy Sheet: unchanged

## Release gates still open

1. Decide the final public address: a Motokraf subdomain or
   `motokraf.vercel.app`.
2. Decide whether the new Sheet's current link-readable sharing must be
   restricted to intended administrators before public release.
3. Give explicit approval for promotion of the new isolated candidate. This is
   separate from the legacy application, which will remain untouched.

## Rollback

Do not promote the candidate. The existing legacy application and its data path
remain independent and available; no record restoration is necessary.

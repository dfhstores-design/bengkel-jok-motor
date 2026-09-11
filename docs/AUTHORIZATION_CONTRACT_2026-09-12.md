# Motokraf Authentication and Authorization Contract

Status: **APPROVED PERSONAL-USE DESIGN — STAGING BACKEND FOUNDATION IMPLEMENTED**

Scope: Personal workshop discipline and business insight. This is intentionally a small single-owner system, not a commercial multi-tenant product.

## Roles and session policy

- Owner and Operator login screens follow the approved Motokraf demo.
- The selected role is never trusted from browser state alone.
- The server issues the session after validating the submitted role and PIN.
- Owner and Operator sessions end on logout or after 6 hours without activity.
- Logout clears the browser session.
- No commercial tenant, billing, or enterprise identity system is required.
- PIN hashes and roles are stored in an `AuthUsers` sheet. Plain PINs must never be stored.
- The login role is selected from a dropdown populated from active `AuthUsers` rows.
- The Owner may add or deactivate users from the UI; manual Sheet maintenance remains supported for recovery.
- Signing keys and session secrets are runtime-injected. They must not be committed, placed in frontend JavaScript, or sent in chat.

## Request flow

1. Browser submits role and PIN to the Vercel auth route.
2. Vercel forwards the login request to the isolated Apps Script staging backend.
3. Apps Script validates the role credential and issues a signed session reference.
4. Vercel stores the session in an HttpOnly, Secure, SameSite cookie.
5. Every read/write request is authorized server-side and forwarded with the session proof.
6. Apps Script derives the actor from the verified session, never from `mode`, `created_by`, or `updated_by` supplied by the browser.

## Audit identity

- Existing operational fields remain authoritative: `created_by`, `updated_by`, `created_at`, and `updated_at`.
- The verified account and role are written to those fields for new or edited records.
- An additive audit log is required for edit actions, containing action, entity ID, actor, role, timestamp, changed fields, and before/after values.
- No existing operational row, ID, timestamp, status, or relation may be rewritten merely to introduce authentication.

## Owner history edit contract

- Only an authenticated Owner session may call the history edit endpoint.
- Operator sessions receive a server-side authorization error.
- Allowed fields are limited to customer name, customer WhatsApp, work description, and notes.
- `job_id`, `payment_id`, `expense_id`, `media_id`, creation fields, status, close time, payment amount, and entity relations are immutable.
- A CLOSED Job cannot be reopened or converted to an active Job.
- Every successful edit requires an idempotency key and audit record.
- The endpoint must reject forged `mode: "OWNER"` values when the session is not an authenticated Owner session.

## Staging acceptance tests

- Valid Owner login succeeds and can read history.
- Valid Operator login succeeds and can use Operator work flow.
- Forged role or PIN fails without revealing which credential component was wrong.
- Owner and Operator sessions end after logout or 6 hours of inactivity.
- Owner can add or deactivate a user; the role dropdown reflects active users.
- Owner history edit changes only an allowed field and records audit evidence.
- Operator history edit is rejected.
- Attempts to change immutable IDs, status, payment, or relations are rejected.
- Production is not used for auth tests or synthetic records.

## Current implementation boundary

- Staging Apps Script now has additive `AuthUsers` support, SHA-256 PIN verification, UUID session references, six-hour idle expiry, logout invalidation, Owner-only user listing, Owner-only user creation, and server-side session gating for operational actions.
- The staging-only smoke test passed for Owner login, Operator login, invalid PIN rejection, Owner-only authorization, logout invalidation, and no PIN exposure in returned data.
- Frontend login/session wiring is implemented in the staging candidate. Direct operational Apps Script actions are also gated by `requireAuth_`; production remains unchanged.

## Production gate

Implementation may be promoted only after secure runtime injection, staging tests, session revocation evidence, audit evidence, and rollback evidence are complete. No production deployment or production write is authorized by this design document.

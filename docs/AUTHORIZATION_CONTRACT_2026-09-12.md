# Motokraf Authentication and Authorization Contract

Status: **APPROVED DESIGN — STAGING IMPLEMENTATION REQUIRED**

## Roles and session policy

- Owner and Operator login screens follow the approved Motokraf demo.
- The selected role is never trusted from browser state alone.
- The server issues the session after validating the submitted role and PIN.
- Owner sessions do not expire automatically, but remain revocable by the owner or administrator.
- Operator sessions expire after 2 hours without an authenticated request or other recorded activity.
- Logout revokes the session and clears the browser cookie.
- PINs, signing keys, and session secrets are runtime-injected. They must not be committed, placed in frontend JavaScript, or sent in chat.

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
- Owner session remains valid beyond 2 hours until revoked.
- Operator session is rejected after 2 hours of inactivity.
- Owner history edit changes only an allowed field and records audit evidence.
- Operator history edit is rejected.
- Attempts to change immutable IDs, status, payment, or relations are rejected.
- Production is not used for auth tests or synthetic records.

## Production gate

Implementation may be promoted only after secure runtime injection, staging tests, session revocation evidence, audit evidence, and rollback evidence are complete. No production deployment or production write is authorized by this design document.

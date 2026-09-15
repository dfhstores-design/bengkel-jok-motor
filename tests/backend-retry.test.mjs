import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "../frontend/node_modules/typescript/lib/typescript.js";

function loadBackend() {
  const source = readFileSync(new URL("../frontend/lib/backend.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const module = { exports: {} };
  const require = (name) => {
    if (name === "next/server") return { NextResponse: { json: (payload, init = {}) => ({ payload, status: init.status ?? 200 }) } };
    if (name === "next/headers") return { cookies: async () => ({ get: () => undefined }) };
    throw new Error(`Unexpected module: ${name}`);
  };
  new Function("exports", "module", "require", compiled.outputText)(module.exports, module, require);
  return module.exports;
}

test("idempotent POST retries one transient backend failure", async () => {
  const { forwardBackend } = loadBackend();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ success: calls === 2 }), { status: calls === 1 ? 503 : 200 });
  };
  try {
    const result = await forwardBackend(new URL("https://example.test"), { method: "POST", body: JSON.stringify({ idempotency_key: "safe-retry-001" }) });
    assert.equal(calls, 2);
    assert.equal(result.status, 200);
    assert.equal(result.payload.success, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("non-idempotent POST is never retried", async () => {
  const { forwardBackend } = loadBackend();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ success: false }), { status: 503 });
  };
  try {
    const result = await forwardBackend(new URL("https://example.test"), { method: "POST", body: JSON.stringify({ pin: "redacted" }) });
    assert.equal(calls, 1);
    assert.equal(result.status, 503);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

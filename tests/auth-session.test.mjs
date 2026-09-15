import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.resolve(here, '..', 'apps-script', 'Auth.gs'), 'utf8');
const properties = new Map();
let now = Date.parse('2026-09-15T12:00:00.000Z');
class FixedDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}
const sandbox = {
  Date: FixedDate,
  JSON,
  PropertiesService: { getScriptProperties: () => ({
    getProperty: (key) => properties.get(key) ?? null,
    setProperty: (key, value) => properties.set(key, value),
    deleteProperty: (key) => properties.delete(key),
  }) },
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

function storeSession(token, role, idleMs) {
  properties.set('SESSION_' + token, JSON.stringify({
    user_id: role.toLowerCase(),
    role,
    last_activity: new Date(now - idleMs).toISOString(),
  }));
}

test('Owner session remains valid through six idle hours and expires after', () => {
  storeSession('owner-at-limit', 'OWNER', 6 * 60 * 60 * 1000);
  assert.equal(sandbox.authSession_('owner-at-limit', false).role, 'OWNER');

  storeSession('owner-expired', 'OWNER', 6 * 60 * 60 * 1000 + 1);
  assert.equal(sandbox.authSession_('owner-expired', false), null);
  assert.equal(properties.has('SESSION_owner-expired'), false);
});

test('Operator session remains valid through two idle hours and expires after', () => {
  storeSession('operator-at-limit', 'OPERATOR', 2 * 60 * 60 * 1000);
  assert.equal(sandbox.authSession_('operator-at-limit', false).role, 'OPERATOR');

  storeSession('operator-expired', 'OPERATOR', 2 * 60 * 60 * 1000 + 1);
  assert.equal(sandbox.authSession_('operator-expired', false), null);
  assert.equal(properties.has('SESSION_operator-expired'), false);
});

test('session with an unsupported role is rejected and removed', () => {
  storeSession('unknown-role', 'ADMIN', 0);
  assert.equal(sandbox.authSession_('unknown-role', false), null);
  assert.equal(properties.has('SESSION_unknown-role'), false);
});

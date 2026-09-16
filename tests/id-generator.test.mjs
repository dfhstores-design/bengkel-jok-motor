import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', 'apps-script');
const properties = new Map();
let locked = false;
const sandbox = {
  APP: { ENTITY_PREFIX: { JOB: 'JOB', PAYMENT: 'PAY', EXPENSE: 'EXP', MEDIA: 'MED' } },
  todayKey_: () => '20260820',
  PropertiesService: { getScriptProperties: () => ({
    getProperty: (k) => properties.get(k) ?? null,
    setProperty: (k, v) => properties.set(k, v),
  }) },
  LockService: { getScriptLock: () => ({
    waitLock: () => { assert.equal(locked, false); locked = true; },
    releaseLock: () => { locked = false; },
  }) },
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'IdGenerator.gs'), 'utf8'), sandbox);

test('ID format and daily sequence are deterministic and unique', () => {
  assert.equal(sandbox.generateEntityId_('JOB'), 'JOB-20260820-0001');
  assert.equal(sandbox.generateEntityId_('JOB'), 'JOB-20260820-0002');
  assert.equal(sandbox.generateEntityId_('PAYMENT'), 'PAY-20260820-0001');
  assert.equal(sandbox.generateEntityId_('EXPENSE'), 'EXP-20260820-0001');
  assert.equal(sandbox.generateEntityId_('MEDIA'), 'MED-20260820-0001');
});

test('unknown entity types are rejected', () => {
  assert.throws(() => sandbox.generateEntityId_('UNKNOWN'), /INVALID_ENTITY_TYPE/);
});

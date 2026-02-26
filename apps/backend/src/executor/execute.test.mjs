import test from 'node:test';
import assert from 'node:assert/strict';
import { executeWithGate } from './execute.js';

test('低风险已签名 => 可执行并写审计', async () => {
  const calls = [];
  const deps = {
    submitTx: async (payload) => {
      calls.push(['submitTx', payload.txDigest]);
      return { txDigest: payload.txDigest, status: 'success' };
    },
    writeAudit: async (entry) => {
      calls.push(['writeAudit', entry.txDigest, entry.status]);
      return entry;
    }
  };

  const result = await executeWithGate(
    {
      txDigest: 'tx-low-1',
      action: 'allow',
      approved: true,
      signed: true
    },
    deps
  );

  assert.equal(result.status, 'success');
  assert.equal(calls[0][0], 'submitTx');
  assert.equal(calls[1][0], 'writeAudit');
});

test('高风险未确认 => 禁止执行', async () => {
  const deps = {
    submitTx: async () => ({ status: 'success' }),
    writeAudit: async (entry) => entry
  };

  const result = await executeWithGate(
    {
      txDigest: 'tx-high-1',
      action: 'review',
      approved: false,
      signed: true
    },
    deps
  );

  assert.equal(result.status, 'blocked');
  assert.equal(result.reason, 'review_not_approved');
});

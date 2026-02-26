import test from 'node:test';
import assert from 'node:assert/strict';
import { precheck } from '../../apps/backend/src/precheck/precheck.js';
import { executeWithGate } from '../../apps/backend/src/executor/execute.js';

test('低风险交易闭环', async () => {
  const audit = [];

  const precheckData = precheck({
    address: '0x123',
    amount: 100,
    whitelist: ['0x123'],
    dailyLimit: 1000
  });
  assert.equal(precheckData.action, 'allow');

  const executeData = await executeWithGate(
    { txDigest: 'mock-digest', action: precheckData.action, approved: true, signed: true },
    {
      submitTx: async ({ txDigest }) => ({ txDigest, status: 'success' }),
      writeAudit: async (entry) => {
        audit.push(entry);
        return entry;
      }
    }
  );
  assert.equal(executeData.status, 'success');

  const auditData = audit.find((x) => x.txDigest === 'mock-digest');
  assert.equal(auditData.txDigest, 'mock-digest');
});

test('高风险未确认会被阻断', async () => {
  const audit = [];

  const precheckData = precheck({
    address: '0x123',
    amount: 2000,
    whitelist: ['0x123'],
    dailyLimit: 1000
  });
  assert.equal(precheckData.action, 'review');

  const executeData = await executeWithGate(
    { txDigest: 'review-digest', action: precheckData.action, approved: false, signed: true },
    {
      submitTx: async () => ({ status: 'success' }),
      writeAudit: async (entry) => {
        audit.push(entry);
        return entry;
      }
    }
  );
  assert.equal(executeData.status, 'blocked');
  assert.equal(executeData.reason, 'review_not_approved');
});

test('执行异常时触发回退', async () => {
  const audit = [];

  const executeData = await executeWithGate(
    { txDigest: 'fail-digest', action: 'allow', approved: true, signed: true },
    {
      submitTx: async () => {
        throw new Error('network');
      },
      writeAudit: async (entry) => {
        audit.push(entry);
        return entry;
      }
    }
  );

  assert.equal(executeData.status, 'blocked');
  assert.equal(executeData.reason, 'submit_failed');
  assert.equal(audit[0].txDigest, 'fail-digest');
});

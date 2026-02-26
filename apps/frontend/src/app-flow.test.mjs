import test from 'node:test';
import assert from 'node:assert/strict';
import { FrontendFlow } from './App.js';

test('表单提交触发预审并返回风险结果', async () => {
  const flow = new FrontendFlow({
    precheckApi: async () => ({ action: 'allow', risk: 'low', reason: 'ok' }),
    executeApi: async () => ({ status: 'success' }),
    auditApi: async () => ({ items: [] })
  });

  const risk = await flow.submitTx({ address: '0x123', amount: 10, whitelist: ['0x123'], dailyLimit: 1000 });
  assert.equal(risk.action, 'allow');
  assert.equal(flow.state.needsConfirm, false);
});

test('review 状态必须先确认后执行', async () => {
  let executeCalled = false;
  const flow = new FrontendFlow({
    precheckApi: async () => ({ action: 'review', risk: 'high', reason: 'limit' }),
    executeApi: async () => {
      executeCalled = true;
      return { status: 'success' };
    },
    auditApi: async () => ({ items: [] })
  });

  await flow.submitTx({ address: '0x123', amount: 2000, whitelist: ['0x123'], dailyLimit: 1000 });
  await flow.executeCurrent();
  assert.equal(executeCalled, false);

  flow.confirmReview();
  await flow.executeCurrent();
  assert.equal(executeCalled, true);
});

test('日志查询后可展示审计列表', async () => {
  const flow = new FrontendFlow({
    precheckApi: async () => ({ action: 'allow', risk: 'low', reason: 'ok' }),
    executeApi: async () => ({ status: 'success' }),
    auditApi: async () => ({ items: [{ txDigest: 'tx-1', status: 'success' }] })
  });

  const rows = await flow.loadAuditRows();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].txDigest, 'tx-1');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { explainRisk } from './explain.js';
import { summarizeAudit } from './summary.js';

test('无 OPENAI_API_KEY 时返回模板解释', async () => {
  const prev = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  const text = await explainRisk({ action: 'allow', risk: 'low', reason: '白名单+小额交易' });
  assert.match(text, /低风险交易/);

  if (prev) process.env.OPENAI_API_KEY = prev;
});

test('有 OPENAI_API_KEY 且 API 失败时自动回退模板', async () => {
  const prev = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'dummy-key';

  const failFetch = async () => {
    throw new Error('network down');
  };

  const text = await explainRisk(
    { action: 'review', risk: 'high', reason: '金额超过每日限额' },
    { fetchImpl: failFetch }
  );
  assert.match(text, /高风险交易/);

  if (prev) process.env.OPENAI_API_KEY = prev;
  else delete process.env.OPENAI_API_KEY;
});

test('审计摘要可输出高风险与阻断数量', () => {
  const out = summarizeAudit([
    { txDigest: 'tx-1', action: 'allow', status: 'success' },
    { txDigest: 'tx-2', action: 'review', status: 'blocked' },
    { txDigest: 'tx-3', action: 'review', status: 'success' }
  ]);

  assert.equal(out.total, 3);
  assert.equal(out.reviewCount, 2);
  assert.equal(out.blockedCount, 1);
  assert.match(out.summaryText, /高风险/);
});

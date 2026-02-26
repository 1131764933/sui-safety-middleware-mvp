import test from 'node:test';
import assert from 'node:assert/strict';
import { handlePrecheck } from './precheck.js';
import { handleApprovalConfirm } from './approval.js';

function createMockRes() {
  const output = { statusCode: null, headers: null, body: '' };
  return {
    output,
    writeHead(statusCode, headers) {
      output.statusCode = statusCode;
      output.headers = headers;
    },
    end(body) {
      output.body = body;
    }
  };
}

test('POST /precheck returns action/risk/reason', async () => {
  const res = createMockRes();

  await handlePrecheck(
    {},
    res,
    {
      address: '0x123',
      amount: 100,
      whitelist: ['0x123'],
      dailyLimit: 1000
    },
    {
      explainRiskFn: async () => 'AI: 低风险，可直接执行',
      requireRealAi: true
    }
  );

  assert.equal(res.output.statusCode, 200);
  const data = JSON.parse(res.output.body);
  assert.ok(data.action);
  assert.ok(data.risk);
  assert.ok(data.reason);
  assert.equal(data.aiMode, 'real_api');
  assert.match(data.aiExplanation, /AI:/);
});

test('POST /approval/confirm returns approval status', async () => {
  const res = createMockRes();
  const approvalsStore = new Map();

  await handleApprovalConfirm(
    {},
    res,
    {
      txDigest: 'mock-digest',
      approved: true
    },
    approvalsStore
  );

  assert.equal(res.output.statusCode, 200);
  const data = JSON.parse(res.output.body);
  assert.equal(data.txDigest, 'mock-digest');
  assert.equal(data.approved, true);
});

test('POST /precheck with invalid amount returns 400', async () => {
  const res = createMockRes();

  await handlePrecheck(
    {},
    res,
    {
      address: '0x123',
      amount: -9,
      whitelist: ['0x123'],
      dailyLimit: 1000
    }
  );

  assert.equal(res.output.statusCode, 400);
  const data = JSON.parse(res.output.body);
  assert.equal(data.error, 'invalid_input');
});

test('POST /precheck without OPENAI_API_KEY returns 503 when AI required', async () => {
  const res = createMockRes();

  await handlePrecheck(
    {},
    res,
    {
      address: '0x123',
      amount: 100,
      whitelist: ['0x123'],
      dailyLimit: 1000
    },
    {
      explainRiskFn: async () => {
        throw new Error('OPENAI_API_KEY is required for real AI explanation');
      },
      requireRealAi: true
    }
  );

  assert.equal(res.output.statusCode, 503);
  const data = JSON.parse(res.output.body);
  assert.equal(data.error, 'ai_unavailable');
});

test('POST /precheck with empty whitelist returns 400', async () => {
  const res = createMockRes();

  await handlePrecheck(
    {},
    res,
    {
      address: '0x123',
      amount: 100,
      whitelist: [],
      dailyLimit: 1000
    },
    {
      explainRiskFn: async () => 'should not reach',
      requireRealAi: true
    }
  );

  assert.equal(res.output.statusCode, 400);
  const data = JSON.parse(res.output.body);
  assert.equal(data.error, 'invalid_input');
  assert.equal(data.reason, '白名单参数非法');
});

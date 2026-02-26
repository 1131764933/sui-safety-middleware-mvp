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
    }
  );

  assert.equal(res.output.statusCode, 200);
  const data = JSON.parse(res.output.body);
  assert.ok(data.action);
  assert.ok(data.risk);
  assert.ok(data.reason);
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

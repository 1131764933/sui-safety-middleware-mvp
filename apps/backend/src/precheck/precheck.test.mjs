import test from 'node:test';
import assert from 'node:assert/strict';
import { precheck } from './precheck.js';

test('白名单+小额 => allow', () => {
  const result = precheck({ address: '0x123', amount: 100, whitelist: ['0x123'], dailyLimit: 1000 });
  assert.equal(result.action, 'allow');
  assert.equal(result.risk, 'low');
});

test('白名单+超限 => review', () => {
  const result = precheck({ address: '0x123', amount: 2000, whitelist: ['0x123'], dailyLimit: 1000 });
  assert.equal(result.action, 'review');
  assert.equal(result.risk, 'high');
});

test('非白名单 => block', () => {
  const result = precheck({ address: '0x456', amount: 100, whitelist: ['0x123'], dailyLimit: 1000 });
  assert.equal(result.action, 'block');
  assert.equal(result.risk, 'critical');
});

test('负数金额 => block', () => {
  const result = precheck({ address: '0x123', amount: -9, whitelist: ['0x123'], dailyLimit: 1000 });
  assert.equal(result.action, 'block');
  assert.equal(result.risk, 'critical');
  assert.equal(result.reason, '输入参数非法');
});

test('空白名单 => block', () => {
  const result = precheck({ address: '0x123', amount: 100, whitelist: [], dailyLimit: 1000 });
  assert.equal(result.action, 'block');
  assert.equal(result.risk, 'critical');
  assert.equal(result.reason, '白名单参数非法');
});

test('零限额 => block', () => {
  const result = precheck({ address: '0x123', amount: 100, whitelist: ['0x123'], dailyLimit: 0 });
  assert.equal(result.action, 'block');
  assert.equal(result.risk, 'critical');
  assert.equal(result.reason, '输入参数非法');
});

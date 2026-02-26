// Lightweight runtime placeholders for API contracts.
// We keep this file TS-compatible without requiring extra lint parsers.
export const PrecheckInputShape = {
  address: 'string',
  amount: 'number',
  whitelist: 'string[]',
  dailyLimit: 'number'
};

export const PrecheckOutputShape = {
  action: 'allow|review|block',
  risk: 'low|high|critical',
  reason: 'string'
};

export const ApprovalConfirmInputShape = {
  txDigest: 'string',
  approved: 'boolean'
};

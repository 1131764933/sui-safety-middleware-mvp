export type PrecheckInput = {
  address: string;
  amount: number;
  whitelist: string[];
  dailyLimit: number;
};

export type PrecheckOutput = {
  action: 'allow' | 'review' | 'block';
  risk: 'low' | 'high' | 'critical';
  reason: string;
};

export type ApprovalConfirmInput = {
  txDigest: string;
  approved: boolean;
};

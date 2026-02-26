export function precheck(params) {
  if (!params.whitelist.includes(params.address)) {
    return { action: 'block', risk: 'critical', reason: '地址不在白名单' };
  }
  if (params.amount > params.dailyLimit) {
    return { action: 'review', risk: 'high', reason: '金额超过每日限额' };
  }
  return { action: 'allow', risk: 'low', reason: '白名单+小额交易' };
}

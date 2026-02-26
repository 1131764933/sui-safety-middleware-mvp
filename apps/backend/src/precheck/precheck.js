export function precheck(params) {
  const amount = Number(params?.amount);
  const dailyLimit = Number(params?.dailyLimit);
  const address = typeof params?.address === 'string' ? params.address.trim() : '';
  const whitelist = Array.isArray(params?.whitelist) ? params.whitelist : [];

  if (!address || !Number.isFinite(amount) || !Number.isFinite(dailyLimit) || amount <= 0 || dailyLimit <= 0) {
    return { action: 'block', risk: 'critical', reason: '输入参数非法' };
  }

  if (whitelist.length === 0 || !whitelist.every((x) => typeof x === 'string' && x.trim())) {
    return { action: 'block', risk: 'critical', reason: '白名单参数非法' };
  }

  if (!whitelist.includes(address)) {
    return { action: 'block', risk: 'critical', reason: '地址不在白名单' };
  }
  if (amount > dailyLimit) {
    return { action: 'review', risk: 'high', reason: '金额超过每日限额' };
  }
  return { action: 'allow', risk: 'low', reason: '白名单+小额交易' };
}

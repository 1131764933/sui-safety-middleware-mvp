export function summarizeAudit(items) {
  const total = items.length;
  const reviewCount = items.filter((x) => x.action === 'review').length;
  const blockedCount = items.filter((x) => x.status === 'blocked').length;
  const successCount = items.filter((x) => x.status === 'success').length;

  return {
    total,
    reviewCount,
    blockedCount,
    successCount,
    summaryText: `审计摘要：共${total}笔，含高风险${reviewCount}笔，被阻断${blockedCount}笔，成功${successCount}笔。`
  };
}

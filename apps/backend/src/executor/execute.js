export async function executeWithGate(input, deps) {
  const { txDigest, action, approved, signed } = input;

  // 高风险交易必须先人工确认
  if (action === 'review' && !approved) {
    const blocked = {
      txDigest,
      action,
      status: 'blocked',
      reason: 'review_not_approved'
    };
    await deps.writeAudit(blocked);
    return blocked;
  }

  // 所有可执行交易必须有签名
  if (!signed) {
    const rejected = {
      txDigest,
      action,
      status: 'blocked',
      reason: 'missing_signature'
    };
    await deps.writeAudit(rejected);
    return rejected;
  }

  const submitResult = await deps.submitTx({ txDigest, action });
  const successAudit = {
    txDigest,
    action,
    status: submitResult.status ?? 'success'
  };
  await deps.writeAudit(successAudit);

  return {
    txDigest,
    status: successAudit.status
  };
}

export async function executeWithGate(input, deps) {
  const { txDigest, action, approved, signed } = input;

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

  try {
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
  } catch {
    const failed = {
      txDigest,
      action,
      status: 'blocked',
      reason: 'submit_failed'
    };
    await deps.writeAudit(failed);
    return failed;
  }
}

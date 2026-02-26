export async function handleApprovalConfirm(_req, res, body, approvalsStore) {
  const txDigest = body?.txDigest ?? '';
  const approved = Boolean(body?.approved);

  approvalsStore.set(txDigest, { txDigest, approved, updatedAt: Date.now() });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ txDigest, approved }));
}

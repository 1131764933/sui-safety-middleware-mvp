export async function handleAudit(_req, res, txDigest, auditStore) {
  if (txDigest) {
    const row = auditStore.find((x) => x.txDigest === txDigest);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(row || {}));
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ items: auditStore }));
}

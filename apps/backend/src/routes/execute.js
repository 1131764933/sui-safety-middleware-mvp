import { executeWithGate } from '../executor/execute.js';

export async function handleExecute(_req, res, body, auditStore) {
  const deps = {
    submitTx: async ({ txDigest }) => ({ txDigest, status: 'success' }),
    writeAudit: async (entry) => {
      auditStore.push({ ...entry, timestamp: Date.now() });
      return entry;
    }
  };

  const result = await executeWithGate(
    {
      txDigest: body?.txDigest ?? `tx-${Date.now()}`,
      action: body?.action ?? 'allow',
      approved: Boolean(body?.approved),
      signed: body?.signed !== false
    },
    deps
  );

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}

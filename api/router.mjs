import { handlePrecheck } from '../apps/backend/src/routes/precheck.js';
import { handleApprovalConfirm } from '../apps/backend/src/routes/approval.js';
import { handleExecute } from '../apps/backend/src/routes/execute.js';
import { handleAudit } from '../apps/backend/src/routes/audit.js';

const approvalsStore = globalThis.__approvalsStore || new Map();
const auditStore = globalThis.__auditStore || [];
globalThis.__approvalsStore = approvalsStore;
globalThis.__auditStore = auditStore;

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'POST' && url.pathname === '/api/precheck') {
      const body = await readJsonBody(req);
      return handlePrecheck(req, res, body);
    }

    if (req.method === 'POST' && url.pathname === '/api/approval/confirm') {
      const body = await readJsonBody(req);
      return handleApprovalConfirm(req, res, body, approvalsStore);
    }

    if (req.method === 'POST' && url.pathname === '/api/execute') {
      const body = await readJsonBody(req);
      return handleExecute(req, res, body, auditStore);
    }

    if (req.method === 'GET' && url.pathname === '/api/audit') {
      const txDigest = url.searchParams.get('txDigest');
      return handleAudit(req, res, txDigest, auditStore);
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid request body' }));
  }
}

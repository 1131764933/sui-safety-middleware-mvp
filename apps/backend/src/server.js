import http from 'node:http';
import { handlePrecheck } from './routes/precheck.js';
import { handleApprovalConfirm } from './routes/approval.js';
import { handleExecute } from './routes/execute.js';
import { handleAudit } from './routes/audit.js';

function readJsonBody(req) {
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

export function createServer() {
  const approvalsStore = new Map();
  const auditStore = [];

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');

      if (req.method === 'POST' && url.pathname === '/precheck') {
        const body = await readJsonBody(req);
        return handlePrecheck(req, res, body);
      }

      if (req.method === 'POST' && url.pathname === '/approval/confirm') {
        const body = await readJsonBody(req);
        return handleApprovalConfirm(req, res, body, approvalsStore);
      }

      if (req.method === 'POST' && url.pathname === '/execute') {
        const body = await readJsonBody(req);
        return handleExecute(req, res, body, auditStore);
      }

      if (req.method === 'GET' && url.pathname === '/audit') {
        const txDigest = url.searchParams.get('txDigest');
        return handleAudit(req, res, txDigest, auditStore);
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
}

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handlePrecheck } from './routes/precheck.js';
import { handleApprovalConfirm } from './routes/approval.js';
import { handleExecute } from './routes/execute.js';
import { handleAudit } from './routes/audit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoDir = path.resolve(__dirname, '../../frontend/public');

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

async function serveFile(res, filepath, contentType) {
  try {
    const file = await readFile(filepath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(file);
  } catch {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Demo file not found' }));
  }
}

export function createServer() {
  const approvalsStore = new Map();
  const auditStore = [];

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');

      if (req.method === 'POST' && (url.pathname === '/precheck' || url.pathname === '/api/precheck')) {
        const body = await readJsonBody(req);
        return handlePrecheck(req, res, body);
      }

      if (
        req.method === 'POST' &&
        (url.pathname === '/approval/confirm' || url.pathname === '/api/approval/confirm')
      ) {
        const body = await readJsonBody(req);
        return handleApprovalConfirm(req, res, body, approvalsStore);
      }

      if (req.method === 'POST' && (url.pathname === '/execute' || url.pathname === '/api/execute')) {
        const body = await readJsonBody(req);
        return handleExecute(req, res, body, auditStore);
      }

      if (req.method === 'GET' && (url.pathname === '/demo' || url.pathname === '/demo/')) {
        return serveFile(res, path.join(demoDir, 'index.html'), 'text/html; charset=utf-8');
      }

      if (req.method === 'GET' && url.pathname === '/demo/app.js') {
        return serveFile(res, path.join(demoDir, 'app.js'), 'application/javascript; charset=utf-8');
      }

      if (req.method === 'GET' && (url.pathname === '/audit' || url.pathname === '/api/audit')) {
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

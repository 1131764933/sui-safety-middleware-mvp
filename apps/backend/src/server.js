import http from 'node:http';
import { handlePrecheck } from './routes/precheck.js';
import { handleApprovalConfirm } from './routes/approval.js';

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

  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'POST' && req.url === '/precheck') {
        const body = await readJsonBody(req);
        return handlePrecheck(req, res, body);
      }

      if (req.method === 'POST' && req.url === '/approval/confirm') {
        const body = await readJsonBody(req);
        return handleApprovalConfirm(req, res, body, approvalsStore);
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
}

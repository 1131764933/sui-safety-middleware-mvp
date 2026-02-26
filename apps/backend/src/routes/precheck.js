import { precheck } from '../precheck/precheck.js';

export async function handlePrecheck(req, res, body) {
  const result = precheck(body);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}

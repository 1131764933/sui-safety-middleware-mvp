import { precheck } from '../precheck/precheck.js';
import { explainRisk } from '../ai/explain.js';

export async function handlePrecheck(req, res, body, deps = {}) {
  const explainRiskFn = deps.explainRiskFn || explainRisk;
  const requireRealAi = deps.requireRealAi ?? true;

  if (typeof body !== 'object' || body === null) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid_input', message: '请求体必须为 JSON 对象' }));
    return;
  }

  const result = precheck(body);

  if (result.reason === '输入参数非法' || result.reason === '白名单参数非法') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid_input', ...result }));
    return;
  }

  try {
    const aiExplanation = await explainRiskFn(result, { requireRealApi: requireRealAi });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ...result, aiExplanation, aiMode: 'real_api' }));
    return;
  } catch (error) {
    if (requireRealAi) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'ai_unavailable',
          message: String(error?.message || error),
          hint: '请配置 OPENAI_API_KEY，确保预审可生成真实 AI 解释'
        })
      );
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}

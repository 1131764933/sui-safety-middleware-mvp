const TEMPLATE = {
  low: (reason) => `低风险交易：${reason}，可直接执行。`,
  high: (reason) => `高风险交易：${reason}，需人工确认后执行。`,
  critical: (reason) => `高危交易：${reason}，禁止执行。`
};

function fallbackText(result) {
  return (TEMPLATE[result.risk] || (() => '未知风险等级'))(result.reason);
}

export async function explainRisk(result, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackText(result);

  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs ?? 3000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: `你是区块链交易风控助手。风险等级=${result.risk}，原因=${result.reason}。请用一句中文给用户解释并给出建议。`,
        max_output_tokens: 120
      }),
      signal: controller.signal
    });

    if (!response.ok) return fallbackText(result);

    const data = await response.json();
    const text = (data?.output_text || '').trim();
    return text || fallbackText(result);
  } catch {
    return fallbackText(result);
  } finally {
    clearTimeout(timer);
  }
}

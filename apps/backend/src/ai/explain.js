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
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) {
    if (options.requireRealApi) {
      throw new Error('OPENAI_API_KEY is required for real AI explanation');
    }
    return fallbackText(result);
  }

  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs ?? 3000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: '你是区块链交易风控助手。输出一句中文解释，并给出简短建议。'
      },
      {
        role: 'user',
        content: `风险等级=${result.risk}，原因=${result.reason}`
      }
    ],
    max_tokens: 120,
    temperature: 0.2
  };

  const endpoints = baseUrl.endsWith('/v1')
    ? [`${baseUrl}/chat/completions`]
    : [`${baseUrl}/chat/completions`, `${baseUrl}/v1/chat/completions`];

  try {
    let lastError = null;

    for (const url of endpoints) {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        // Print detailed diagnostics for provider-side failures (401/429/400...)
        console.error(
          `[ai] request failed status=${response.status} url=${url} body=${errText || '<empty>'}`
        );
        lastError = new Error(`API ${response.status} @ ${url}: ${errText || 'no error body'}`);
        continue;
      }

      const data = await response.json();
      const text = (data?.choices?.[0]?.message?.content || '').trim();
      if (text) return text;

      lastError = new Error(`API empty response @ ${url}`);
    }

    if (options.requireRealApi) throw lastError || new Error('API request failed');
    return fallbackText(result);
  } catch (error) {
    console.error(`[ai] request exception: ${String(error?.message || error)}`);
    if (options.requireRealApi) {
      const msg = String(error?.message || 'OpenAI API request failed');
      throw new Error(msg);
    }
    return fallbackText(result);
  } finally {
    clearTimeout(timer);
  }
}

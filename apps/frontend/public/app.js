const el = {
  address: document.getElementById('address'),
  amount: document.getElementById('amount'),
  dailyLimit: document.getElementById('dailyLimit'),
  whitelist: document.getElementById('whitelist'),
  btnPrecheck: document.getElementById('btnPrecheck'),
  btnConfirm: document.getElementById('btnConfirm'),
  btnExecute: document.getElementById('btnExecute'),
  btnRefreshAudit: document.getElementById('btnRefreshAudit'),
  statusText: document.getElementById('statusText'),
  auditRows: document.getElementById('auditRows')
};

let current = {
  txDigest: '',
  precheck: null,
  approved: false
};

function setStatus(title, data) {
  el.statusText.textContent = `${title}\n${JSON.stringify(data, null, 2)}`;
}

function collectPayload() {
  const whitelist = el.whitelist.value
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  return {
    address: el.address.value.trim(),
    amount: Number(el.amount.value || 0),
    dailyLimit: Number(el.dailyLimit.value || 0),
    whitelist
  };
}

function validatePayload(payload) {
  if (!payload.address) return '地址不能为空';
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) return '金额必须为大于 0 的数字';
  if (!Number.isFinite(payload.dailyLimit) || payload.dailyLimit <= 0) return '每日限额必须为大于 0 的数字';
  if (!Array.isArray(payload.whitelist) || payload.whitelist.length === 0) return '白名单不能为空';
  return '';
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function refreshAudit() {
  const data = await fetch('/api/audit').then((r) => r.json());
  const items = data.items ?? [];
  el.auditRows.innerHTML = items
    .slice()
    .reverse()
    .map(
      (row) => `
      <tr>
        <td>${row.txDigest ?? ''}</td>
        <td>${row.action ?? ''}</td>
        <td>${row.status ?? ''}</td>
        <td>${row.reason ?? ''}</td>
      </tr>
    `
    )
    .join('');
}

el.btnPrecheck.addEventListener('click', async () => {
  try {
    current.txDigest = `demo-${Date.now()}`;
    current.approved = false;
    const payload = collectPayload();
    const error = validatePayload(payload);
    if (error) {
      setStatus('预审失败', { error });
      el.btnConfirm.disabled = true;
      el.btnExecute.disabled = true;
      return;
    }
    const result = await postJson('/api/precheck', payload);
    if (result.error) {
      setStatus('预审失败', result);
      el.btnConfirm.disabled = true;
      el.btnExecute.disabled = true;
      return;
    }
    current.precheck = result;

    el.btnConfirm.disabled = result.action !== 'review';
    el.btnExecute.disabled = result.action === 'block';

    setStatus('预审完成', {
      txDigest: current.txDigest,
      ...result
    });
  } catch (error) {
    setStatus('预审失败', { error: String(error) });
  }
});

el.btnConfirm.addEventListener('click', async () => {
  try {
    if (!current.txDigest) {
      setStatus('确认失败', { error: '请先预审' });
      return;
    }
    const result = await postJson('/api/approval/confirm', {
      txDigest: current.txDigest,
      approved: true
    });
    current.approved = true;
    setStatus('人工确认完成', result);
  } catch (error) {
    setStatus('确认失败', { error: String(error) });
  }
});

el.btnExecute.addEventListener('click', async () => {
  try {
    if (!current.precheck || !current.txDigest) {
      setStatus('执行失败', { error: '请先完成预审' });
      return;
    }

    const action = current.precheck.action;
    const approved = action === 'review' ? current.approved : true;

    const result = await postJson('/api/execute', {
      txDigest: current.txDigest,
      action,
      approved,
      signed: true
    });

    setStatus('执行结果', result);
    await refreshAudit();
  } catch (error) {
    setStatus('执行失败', { error: String(error) });
  }
});

el.btnRefreshAudit.addEventListener('click', async () => {
  try {
    await refreshAudit();
    setStatus('审计刷新完成', { ok: true });
  } catch (error) {
    setStatus('审计刷新失败', { error: String(error) });
  }
});

refreshAudit().catch(() => {});

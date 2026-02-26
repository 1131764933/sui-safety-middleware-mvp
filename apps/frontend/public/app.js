const TESTNET_EXPLORER_TX = 'https://suiexplorer.com/txblock';

const el = {
  network: document.getElementById('network'),
  packageId: document.getElementById('packageId'),
  walletAddress: document.getElementById('walletAddress'),
  address: document.getElementById('address'),
  amount: document.getElementById('amount'),
  dailyLimit: document.getElementById('dailyLimit'),
  whitelist: document.getElementById('whitelist'),
  btnConnectWallet: document.getElementById('btnConnectWallet'),
  btnPrecheck: document.getElementById('btnPrecheck'),
  btnConfirm: document.getElementById('btnConfirm'),
  btnExecute: document.getElementById('btnExecute'),
  btnWriteOnchain: document.getElementById('btnWriteOnchain'),
  btnLoadOnchain: document.getElementById('btnLoadOnchain'),
  btnRefreshAudit: document.getElementById('btnRefreshAudit'),
  statusText: document.getElementById('statusText'),
  auditRows: document.getElementById('auditRows'),
  onchainRows: document.getElementById('onchainRows')
};

let client = null;
let SuiSDK = null;
let wallet = null;
const RPC_URL = 'https://fullnode.testnet.sui.io:443';

const state = {
  txDigest: '',
  precheck: null,
  approved: false,
  walletAddress: ''
};

function setStatus(title, data) {
  el.statusText.textContent = `${title}\n${JSON.stringify(data, null, 2)}`;
}

function getWallet() {
  if (window.suiWallet) return window.suiWallet;
  if (window.sui?.suiWallet) return window.sui.suiWallet;
  if (window.sui?.SuiWallet) return window.sui.SuiWallet;
  if (window.sui && typeof window.sui === 'object' && !window.sui.isPhantom) return window.sui;
  if (window.phantom?.sui) return window.phantom.sui;
  if (window.sui && typeof window.sui === 'object') return window.sui;
  return null;
}

async function ensureSuiSdk() {
  if (SuiSDK) return SuiSDK;
  try {
    let txMod = null;

    try {
      txMod = await import('https://esm.sh/@mysten/sui/transactions');
    } catch {
      txMod = await import('https://esm.sh/@mysten/sui.js/transactions');
    }

    const TransactionCtor =
      txMod?.Transaction ||
      txMod?.TransactionBlock ||
      txMod?.default?.Transaction ||
      txMod?.default?.TransactionBlock ||
      txMod?.default;

    if (typeof TransactionCtor !== 'function') {
      throw new Error(`Transaction builder not found. exports=${Object.keys(txMod || {}).join(',')}`);
    }

    SuiSDK = { TransactionCtor };
    client = null;
    return SuiSDK;
  } catch (error) {
    throw new Error(`Sui SDK 加载失败，请检查网络或稍后重试: ${String(error)}`);
  }
}

async function rpcCall(method, params) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'rpc_error');
  return data.result;
}

function normalizeAddress(account) {
  if (!account) return '';
  if (typeof account === 'string') return account;
  if (typeof account.address === 'string') return account.address;
  if (typeof account.account?.address === 'string') return account.account.address;
  if (typeof account.publicKey === 'string' && account.publicKey.startsWith('0x')) return account.publicKey;
  if (typeof account.userAddress === 'string') return account.userAddress;
  return '';
}

function extractAddressFromWallet(walletObj, accounts, connectOut) {
  const candidates = [];

  if (Array.isArray(accounts)) candidates.push(...accounts);
  if (connectOut) candidates.push(connectOut);
  if (connectOut?.accounts && Array.isArray(connectOut.accounts)) candidates.push(...connectOut.accounts);
  if (walletObj?.accounts && Array.isArray(walletObj.accounts)) candidates.push(...walletObj.accounts);
  if (walletObj?.account) candidates.push(walletObj.account);
  if (walletObj?.selectedAddress) candidates.push(walletObj.selectedAddress);
  if (walletObj?.address) candidates.push(walletObj.address);
  if (walletObj?.userAddress) candidates.push(walletObj.userAddress);

  for (const c of candidates) {
    const addr = normalizeAddress(c);
    if (addr && addr.startsWith('0x')) return addr;
  }

  return '';
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

function updateWalletButtons(connected) {
  el.btnWriteOnchain.disabled = !connected;
  el.btnLoadOnchain.disabled = !connected;
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function refreshBackendAudit() {
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

function toBytes(text) {
  return Array.from(new TextEncoder().encode(text));
}

async function connectWallet() {
  setStatus('连接钱包中', { step: 'detect_wallet_provider' });
  wallet = getWallet();
  if (!wallet) {
    setStatus('连接失败', { error: '未检测到 Sui Wallet 插件，请先安装并解锁钱包' });
    return;
  }

  try {
    let connectOut = null;
    if (wallet.requestPermissions) {
      await wallet.requestPermissions();
    }
    if (wallet.requestAccount) {
      const requested = await wallet.requestAccount();
      if (requested && !connectOut) connectOut = requested;
    }
    if (wallet.connect) {
      connectOut = await wallet.connect();
    }
    let accounts = [];
    if (wallet.getAccounts) {
      accounts = await wallet.getAccounts();
    } else if (wallet.account) {
      accounts = [wallet.account];
    }

    const address = extractAddressFromWallet(wallet, accounts, connectOut);
    if (!address) {
      setStatus('连接失败', {
        error: '钱包已连接，但未拿到地址信息',
        walletKeys: Object.keys(wallet || {}),
        accountsPreview: Array.isArray(accounts) ? accounts.slice(0, 2) : accounts,
        connectPreview: connectOut || null
      });
      return;
    }

    state.walletAddress = address;
    el.walletAddress.value = address;
    if (!el.address.value || el.address.value === '0x123') {
      el.address.value = address;
    }
    updateWalletButtons(true);
    setStatus('钱包连接成功', { address, network: el.network.value });
  } catch (error) {
    setStatus('连接失败', { error: String(error) });
  }
}

async function signAndExecuteTx(tx) {
  if (!wallet) throw new Error('wallet_not_connected');

  if (wallet.signAndExecuteTransaction) {
    return wallet.signAndExecuteTransaction({
      transaction: tx,
      chain: 'sui:testnet',
      options: { showEffects: true, showObjectChanges: true }
    });
  }

  if (wallet.signAndExecuteTransactionBlock) {
    return wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: { showEffects: true, showObjectChanges: true }
    });
  }

  throw new Error('wallet_api_not_supported');
}

async function writeAuditOnchain() {
  if (!state.walletAddress) {
    setStatus('上链失败', { error: '请先连接钱包' });
    return;
  }

  const packageId = el.packageId.value.trim();
  if (!packageId.startsWith('0x')) {
    setStatus('上链失败', { error: 'Package ID 格式错误' });
    return;
  }

  const txDigestText = state.txDigest || `demo-${Date.now()}`;
  const action = state.precheck?.action || 'allow';
  const success = action !== 'block';
  const { TransactionCtor } = await ensureSuiSdk();
  const tx = new TransactionCtor();
  const txDigestBytes = toBytes(txDigestText);
  const actionBytes = toBytes(action);

  const pureBytes = (val) => {
    if (tx.pure?.vector) return tx.pure.vector('u8', val);
    if (typeof tx.pure === 'function') return tx.pure(val);
    throw new Error('transaction builder does not support pure bytes');
  };
  const pureBool = (val) => {
    if (tx.pure?.bool) return tx.pure.bool(val);
    if (typeof tx.pure === 'function') return tx.pure(val);
    throw new Error('transaction builder does not support pure bool');
  };

  tx.moveCall({
    target: `${packageId}::audit::create_and_transfer`,
    arguments: [
      pureBytes(txDigestBytes),
      pureBytes(actionBytes),
      pureBool(success)
    ]
  });

  try {
    const result = await signAndExecuteTx(tx);
    const digest = result?.digest || result?.effects?.transactionDigest;
    const explorer = digest ? `${TESTNET_EXPLORER_TX}/${digest}?network=testnet` : '';

    setStatus('链上写审计成功', {
      packageId,
      digest,
      explorer
    });
  } catch (error) {
    setStatus('链上写审计失败', { error: String(error) });
  }
}

async function loadOnchainAudit() {
  if (!state.walletAddress) {
    setStatus('读取失败', { error: '请先连接钱包' });
    return;
  }

  const packageId = el.packageId.value.trim();
  if (!packageId.startsWith('0x')) {
    setStatus('读取失败', { error: 'Package ID 格式错误' });
    return;
  }

  try {
    const out = await rpcCall('suix_getOwnedObjects', [
      state.walletAddress,
      {
        filter: { StructType: `${packageId}::audit::AuditObject` },
        options: { showContent: true, showType: true }
      }
    ]);

    const rows = out?.data || [];
    el.onchainRows.innerHTML = rows
      .map((item) => {
        const fields = item.data?.content?.fields || {};
        return `
          <tr>
            <td>${item.data?.objectId || ''}</td>
            <td>${JSON.stringify(fields.tx_digest ?? '')}</td>
            <td>${JSON.stringify(fields.action ?? '')}</td>
            <td>${String(fields.status ?? '')}</td>
          </tr>
        `;
      })
      .join('');

    setStatus('读取链上审计成功', {
      owner: state.walletAddress,
      count: rows.length
    });
  } catch (error) {
    setStatus('读取链上审计失败', { error: String(error) });
  }
}

el.btnConnectWallet.addEventListener('click', connectWallet);

el.btnPrecheck.addEventListener('click', async () => {
  try {
    state.txDigest = `demo-${Date.now()}`;
    state.approved = false;
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
    state.precheck = result;

    el.btnConfirm.disabled = result.action !== 'review';
    el.btnExecute.disabled = result.action === 'block';

    setStatus('预审完成', {
      txDigest: state.txDigest,
      ...result
    });
  } catch (error) {
    setStatus('预审失败', { error: String(error) });
  }
});

el.btnConfirm.addEventListener('click', async () => {
  try {
    if (!state.txDigest) {
      setStatus('确认失败', { error: '请先预审' });
      return;
    }
    const result = await postJson('/api/approval/confirm', {
      txDigest: state.txDigest,
      approved: true
    });
    state.approved = true;
    setStatus('人工确认完成', result);
  } catch (error) {
    setStatus('确认失败', { error: String(error) });
  }
});

el.btnExecute.addEventListener('click', async () => {
  try {
    if (!state.precheck || !state.txDigest) {
      setStatus('执行失败', { error: '请先完成预审' });
      return;
    }

    const action = state.precheck.action;
    const approved = action === 'review' ? state.approved : true;

    const result = await postJson('/api/execute', {
      txDigest: state.txDigest,
      action,
      approved,
      signed: true
    });

    setStatus('执行结果（后端）', result);
    await refreshBackendAudit();
  } catch (error) {
    setStatus('执行失败', { error: String(error) });
  }
});

el.btnWriteOnchain.addEventListener('click', writeAuditOnchain);
el.btnLoadOnchain.addEventListener('click', loadOnchainAudit);

el.btnRefreshAudit.addEventListener('click', async () => {
  try {
    await refreshBackendAudit();
    setStatus('后端审计刷新完成', { ok: true });
  } catch (error) {
    setStatus('后端审计刷新失败', { error: String(error) });
  }
});

updateWalletButtons(false);
refreshBackendAudit().catch(() => {});

window.addEventListener('error', (e) => {
  setStatus('页面脚本错误', { error: e.message || 'unknown_error' });
});
  await ensureSuiSdk();

import { useMemo, useState } from 'react';
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClientQuery
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID_DEFAULT =
  '0xd913710e5fd3a83edeaf948793212a2cb33dab54fa84d7617c913f57864bb619';

type PrecheckResult = {
  action: 'allow' | 'review' | 'block';
  risk: string;
  reason: string;
  aiExplanation?: string;
};

export function DemoApp() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [packageId, setPackageId] = useState(PACKAGE_ID_DEFAULT);
  const [amount, setAmount] = useState(100);
  const [dailyLimit, setDailyLimit] = useState(1000);
  const [address, setAddress] = useState('0x123');
  const [whitelist, setWhitelist] = useState('0x123');
  const [status, setStatus] = useState('等待操作...');
  const [precheck, setPrecheck] = useState<PrecheckResult | null>(null);
  const [approved, setApproved] = useState(false);

  const structType = `${packageId}::audit::AuditObject`;

  const { data: onchainData, refetch: refetchOnchain } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address ?? '0x0',
      filter: { StructType: structType },
      options: { showContent: true, showType: true }
    },
    { enabled: Boolean(account?.address) }
  );

  const onchainRows = useMemo(() => onchainData?.data ?? [], [onchainData]);

  async function doPrecheck() {
    const payload = {
      address,
      amount: Number(amount),
      dailyLimit: Number(dailyLimit),
      whitelist: whitelist
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    };

    const res = await fetch('/api/precheck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(`预审失败: ${JSON.stringify(data)}`);
      return;
    }

    setPrecheck(data);
    setApproved(false);
    setStatus(`预审完成: ${JSON.stringify(data)}`);
  }

  async function doExecuteBackend() {
    if (!precheck) {
      setStatus('请先预审');
      return;
    }
    const body = {
      txDigest: `demo-${Date.now()}`,
      action: precheck.action,
      approved: precheck.action === 'review' ? approved : true,
      signed: true
    };

    const res = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    setStatus(`后端执行结果: ${JSON.stringify(data)}`);
  }

  async function writeOnchainAudit() {
    if (!account?.address) {
      setStatus('请先连接钱包');
      return;
    }

    const tx = new Transaction();
    const digest = `demo-${Date.now()}`;
    const action = precheck?.action ?? 'allow';
    tx.moveCall({
      target: `${packageId}::audit::create_and_transfer`,
      arguments: [
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(digest))),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(action))),
        tx.pure.bool(action !== 'block')
      ]
    });

    try {
      const out = await signAndExecute({
        transaction: tx
      });
      setStatus(`上链成功: digest=${out.digest}`);
      await refetchOnchain();
    } catch (err) {
      setStatus(`上链失败: ${String(err)}`);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-logo" aria-label="Sui Safety Middleware Logo">
          <svg viewBox="0 0 96 96" role="img">
            <defs>
              <linearGradient id="dropBlue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9ce3ff" />
                <stop offset="100%" stopColor="#2f7cff" />
              </linearGradient>
              <linearGradient id="shieldBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8f7ff" />
                <stop offset="100%" stopColor="#cde7ff" />
              </linearGradient>
            </defs>
            <path d="M48 10c-9 16-22 24-22 41a22 22 0 0 0 44 0c0-17-13-25-22-41Z" fill="url(#dropBlue)" />
            <path d="M48 26c-5 9-12 14-12 24a12 12 0 0 0 24 0c0-10-7-15-12-24Z" fill="#ffffff" />
            <rect x="16" y="54" width="64" height="28" rx="10" fill="url(#shieldBlue)" />
            <path d="M32 68h32" stroke="#2a73f6" strokeWidth="4" strokeLinecap="round" />
            <path d="M48 60v16" stroke="#2a73f6" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1>Sui Safety Middleware</h1>
          <p>官方钱包直连 + Testnet 合约交互 + 安全预审闸门</p>
        </div>
      </header>

      <div className="panel">
        <div className="row">
          <label>Network</label>
          <input value="testnet" disabled />
        </div>
        <div className="row">
          <label>Package ID</label>
          <input value={packageId} onChange={(e) => setPackageId(e.target.value)} />
        </div>
        <div className="row">
          <label>钱包地址</label>
          <input value={account?.address ?? ''} placeholder="点击 Connect Wallet 连接" readOnly />
        </div>
        <div className="row">
          <ConnectButton />
        </div>
      </div>

      <div className="panel two">
        <div className="row">
          <label>地址</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="row">
          <label>金额</label>
          <input value={amount} type="number" onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>每日限额</label>
          <input value={dailyLimit} type="number" onChange={(e) => setDailyLimit(Number(e.target.value))} />
        </div>
        <div className="row">
          <label>白名单（逗号分隔）</label>
          <input value={whitelist} onChange={(e) => setWhitelist(e.target.value)} />
        </div>
      </div>

      <div className="panel actions">
        <button onClick={doPrecheck}>1) 预审</button>
        <button
          onClick={() => setApproved(true)}
          disabled={!precheck || precheck.action !== 'review'}
        >
          2) 人工确认
        </button>
        <button onClick={doExecuteBackend} disabled={!precheck}>
          3) 执行（后端）
        </button>
        <button onClick={writeOnchainAudit} disabled={!account?.address}>
          4) 上链写审计
        </button>
        <button onClick={() => refetchOnchain()} disabled={!account?.address}>
          5) 读取链上审计
        </button>
      </div>

      <div className="panel">
        <h3>状态面板</h3>
        <pre>{status}</pre>
      </div>

      <div className="panel">
        <h3>链上审计对象（当前钱包）</h3>
        <table>
          <thead>
            <tr>
              <th>objectId</th>
              <th>type</th>
            </tr>
          </thead>
          <tbody>
            {onchainRows.map((row) => (
              <tr key={row.data?.objectId}>
                <td>{row.data?.objectId}</td>
                <td>{row.data?.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

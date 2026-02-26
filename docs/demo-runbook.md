# Demo Runbook（黑客松演示手册）

## 1. 准备步骤

```bash
cd /Users/yhb/Desktop/sui-agents
npm install
export OPENAI_API_KEY="your_real_key"
npm run test
```

启动服务：

```bash
# 终端1
PORT=3001 node apps/backend/src/index.js

# 终端2
npm run --workspace apps/frontend dev
```

确认：
- 后端输出：`[backend] listening on http://127.0.0.1:3001`
- 前端输出：`VITE ... Local: http://127.0.0.1:5173`

前置要求：
- 浏览器安装并解锁 Sui Wallet 插件
- 钱包网络切换到 `Testnet`
- 页面 `Package ID` 默认值为：`0xab52ad97fc2a24e3070b7999fc7eeca5baef006269ac39245f3da7d5caecd5fd`

## 2. YouTube 推荐演示主线（3-5 分钟）

打开：`http://127.0.0.1:5173`

### 段落 A：钱包与链上连接（30-45 秒）
1. 点击 `Connect Wallet`
2. 页面显示钱包地址
3. 说明当前 Network=Testnet、Package ID 已配置

预期：
- 状态面板显示 `钱包连接成功`

### 段落 B：预审与闸门（60-90 秒）
1. 输入交易参数（先用低风险样例：白名单地址 + 小额）
2. 点击 `1) 预审`，展示 `allow` + `aiExplanation`
3. 点击 `3) 执行（后端）`

预期：
- 后端执行成功
- 后端审计表新增一条记录

### 段落 C：链上写入与读取（60-90 秒）
1. 点击 `4) 上链写审计`（钱包签名）
2. 状态面板展示链上 `digest` 与 explorer 链接
3. 点击 `5) 读取链上审计`

预期：
- 链上审计对象表出现 `AuditObject`
- 可证明“前端已直连钱包与链上合约”

### 段落 D：风险阻断（45-60 秒）
1. 输入高风险样例（超限）
2. 点击 `1) 预审` -> `review`
3. 不点确认，直接点击 `3) 执行（后端）`

预期：
- 返回 `blocked`（`review_not_approved`）
- 强调“默认保守阻断”

## 3. 备用命令行演示（网络不稳定时）

```bash
bash scripts/demo-low-risk.sh
bash scripts/demo-high-risk-review.sh
bash scripts/demo-failure-fallback.sh
```

## 4. 提交页字段对应（防漏填）

- Deployment Network：`Testnet`
- Package ID：`0xab52ad97fc2a24e3070b7999fc7eeca5baef006269ac39245f3da7d5caecd5fd`
- Project Repo：GitHub 仓库链接
- Website：Vercel `/demo` 地址
- Demo Video：YouTube 链接

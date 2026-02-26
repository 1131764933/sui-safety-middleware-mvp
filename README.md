# Sui Safety Middleware MVP

面向 Sui 黑客松 Safety & Security 赛道的最小可运行闭环：
`预审 -> 人工确认闸门 -> 执行 -> 审计日志 -> 钱包签名上链`。

## 项目结构

- `apps/backend`：预审、审批、执行、审计 API 与单测
- `apps/frontend`：前端闭环 + Sui 钱包连接 + 链上审计写入/读取
- `contracts/safety_middleware`：Move 策略对象与审计对象
- `tests/e2e`：最小闭环 E2E 验收
- `scripts`：黑客松演示脚本
- `docs`：交付文档与计划文档

## 环境要求

- Node.js >= 20
- Sui CLI >= 1.25（当前已验证：1.66.2）
- `OPENAI_API_KEY`（必需，预审阶段强制调用真实 API 生成解释）

## 安装

```bash
npm install
```

## 配置 OpenAI Key

```bash
export OPENAI_API_KEY="your_real_key"
```

## 运行测试

```bash
npm run test
```

只跑后端：

```bash
npm run --workspace apps/backend test
```

只跑前端：

```bash
npm run --workspace apps/frontend test
```

只跑 E2E：

```bash
node --test tests/e2e/minimal-closed-loop.spec.mjs
```

## 启动后端服务

```bash
node apps/backend/src/index.js
```

默认监听 `http://127.0.0.1:3000`。

## 浏览器演示（React + dapp-kit）

启动后端与前端：

```bash
# 终端1：后端
PORT=3001 node apps/backend/src/index.js

# 终端2：前端
npm run --workspace apps/frontend dev
```

打开：

`http://127.0.0.1:5173`

页面内按顺序点击：
1. `Connect Wallet`
2. `预审`
3. `人工确认`（仅 `review` 需要）
4. `执行（后端）`
5. `上链写审计`
6. `读取链上审计`
7. `刷新后端审计`

可直接观察：
- `allow/review/block`、`aiExplanation`
- 后端审计日志变化（通过 `/api` 代理到 `3001`）
- 链上交易 digest 与钱包持有的 `AuditObject`

## 演示脚本

在后端服务运行后执行：

```bash
bash scripts/demo-low-risk.sh
bash scripts/demo-high-risk-review.sh
bash scripts/demo-failure-fallback.sh
```

更多演示细节见：`docs/demo-runbook.md`

## 部署到 Vercel

1. 安装并登录：
```bash
npm i -g vercel
vercel login
```
2. 在项目根目录设置环境变量：
```bash
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_API_KEY preview
```
3. 首次部署：
```bash
vercel
```
4. 发布到生产：
```bash
vercel --prod
```

部署后访问：
- 演示页：`https://<your-domain>/demo`
- API：`https://<your-domain>/api/precheck`

## 已发布 Testnet 包（用于前端链上交互）

- Network: `testnet`
- Package ID: `0xab52ad97fc2a24e3070b7999fc7eeca5baef006269ac39245f3da7d5caecd5fd`
- Publish Tx: `FFip4UuSAobxeENzqkVYUR3G8vxBSaXBKk6edwYNQFwy`

## 安全边界说明

见：`docs/security-assumptions.md`

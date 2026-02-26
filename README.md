# Sui Safety Middleware MVP

面向 Sui 黑客松 Safety & Security 赛道的最小可运行闭环：
`预审 -> 人工确认闸门 -> 执行 -> 审计日志`。

## 项目结构

- `apps/backend`：预审、审批、执行、审计 API 与单测
- `apps/frontend`：前端闭环流程最小实现与单测
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

## 浏览器演示（最小页面）

启动后端后，打开：

`http://127.0.0.1:3000/demo`

页面内按顺序点击：
1. `预审`
2. `人工确认`（仅 `review` 需要）
3. `执行`
4. `刷新审计`

可直接观察 `allow/review/block`、`aiExplanation` 与审计日志变化。

## 演示脚本

在后端服务运行后执行：

```bash
bash scripts/demo-low-risk.sh
bash scripts/demo-high-risk-review.sh
bash scripts/demo-failure-fallback.sh
```

更多演示细节见：`docs/demo-runbook.md`

## 安全边界说明

见：`docs/security-assumptions.md`

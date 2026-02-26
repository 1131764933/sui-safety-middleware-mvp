# Demo Runbook（黑客松演示手册）

## 1. 准备步骤

```bash
cd /Users/yhb/Desktop/sui-agents/.worktrees/task1-bootstrap
npm install
export OPENAI_API_KEY="your_real_key"
npm run test
node apps/backend/src/index.js
```

确认后端输出：`[backend] listening on http://127.0.0.1:3000`
说明：`/precheck` 强制调用真实 OpenAI API；未配置 key 会返回 `503 ai_unavailable`。

## 2. 浏览器最小演示（推荐）

打开：

`http://127.0.0.1:3000/demo`

页面操作顺序：
1. 填写交易参数（默认可直接用）
2. 点击 `1) 预审`
3. 若返回 `review`，点击 `2) 人工确认`
4. 点击 `3) 执行`
5. 点击 `4) 刷新审计`

预期：
- `allow`：可直接执行，审计出现 `status=success`
- `review`：未确认时执行会被阻断，确认后可执行
- `block`：执行按钮禁用（前端保护）
- 状态面板包含 `aiExplanation`（真实 API 返回文本）

## 3. 演示路径 A：低风险交易闭环（命令行）

命令：

```bash
bash scripts/demo-low-risk.sh
```

预期：
- `/precheck` 返回 `action=allow`
- 可继续执行交易并写入审计

截图位：
- [截图A1：预审返回allow]
- [截图A2：执行成功状态]

## 4. 演示路径 B：高风险交易 + 人工确认（命令行）

命令：

```bash
bash scripts/demo-high-risk-review.sh
```

预期：
- `/precheck` 返回 `action=review`
- 经 `/approval/confirm` 后执行成功
- 审计日志包含本次高风险路径

截图位：
- [截图B1：预审返回review]
- [截图B2：人工确认结果]
- [截图B3：执行成功与审计记录]

## 5. 演示路径 C：失败回退（命令行）

命令：

```bash
bash scripts/demo-failure-fallback.sh
```

预期：
- 返回 `status=blocked`
- 原因为 `review_not_approved` 或回退原因
- 演示“系统宁可阻断也不误执行”

截图位：
- [截图C1：blocked结果]

## 6. 演示结束检查

- 低风险路径可执行
- 高风险未确认不会执行
- 回退路径会保守阻断
- 核心日志可追溯（按 txDigest 查询）

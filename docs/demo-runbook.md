# Demo Runbook（黑客松演示手册）

## 1. 准备步骤

```bash
npm install
npm run test
node apps/backend/src/index.js
```

确认后端输出：`[backend] listening on http://127.0.0.1:3000`

## 2. 演示路径 A：低风险交易闭环

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

## 3. 演示路径 B：高风险交易 + 人工确认

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

## 4. 演示路径 C：失败回退

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

## 5. 演示结束检查

- 低风险路径可执行
- 高风险未确认不会执行
- 回退路径会保守阻断
- 核心日志可追溯（按 txDigest 查询）

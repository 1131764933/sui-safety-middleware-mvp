# Sui 新人 7 天学习与实战执行计划（基于当前项目）

## 目标
- 7 天内从“能跑 MVP”升级到“可讲清安全设计、可演示关键证据、可继续迭代”的状态。
- 每天都有可交付物：代码/测试/文档/演示证据至少一项。

## 周期（固定日期）
- Day 1：2026-02-26（已执行）
- Day 2：2026-02-27
- Day 3：2026-02-28
- Day 4：2026-03-01
- Day 5：2026-03-02
- Day 6：2026-03-03
- Day 7：2026-03-04

## 每日计划

### Day 1（环境与基线）
- 学习重点：Sui 工具链、项目结构、当前闭环边界。
- 执行任务：
  - 跑通 `lint/test/move test` 三项。
  - 记录版本与验证证据。
- 验收标准：
  - Node、npm、Sui CLI 版本可用。
  - 三项检查全绿。

### Day 2（Move 与策略安全）
- 学习重点：Move 权限控制、错误码、测试可读性。
- 执行任务：
  - 清理 Move warning。
  - 固化错误码常量，补充测试定位。
- 验收标准：
  - `sui move test` 无 warning、2/2 通过。

### Day 3（后端风控约束）
- 学习重点：输入校验、服务端可信边界。
- 执行任务：
  - 补齐非法输入、空白名单、极端值测试。
  - 明确 400/503 错误语义文档。
- 验收标准：
  - 预审接口反例全部可复现并被阻断。

### Day 4（签名与执行可信链）
- 学习重点：执行器不信任前端输入、审批绑定。
- 执行任务：
  - 将 `/execute` 改为基于服务端预审结果执行（而非前端 action）。
  - 增加重放与伪造审批防护测试。
- 验收标准：
  - 前端篡改 action 无法绕过执行闸门。

### Day 5（Sui 钱包真实链路）
- 学习重点：Sui Wallet 签名与交易流程。
- 执行任务：
  - 接入最小真实签名流程（先测试网）。
  - 演示“代理提议 -> 钱包确认 -> 执行”。
- 验收标准：
  - 至少 1 条真实签名交易证据可展示。

### Day 6（链上审计与证明叙事）
- 学习重点：可验证审计、证据结构化。
- 执行任务：
  - 统一审计字段（txDigest, action, status, reason, aiMode, timestamp）。
  - 输出评审用“安全证据页”文档。
- 验收标准：
  - demo 时可以按 txDigest 完整回放关键步骤。

### Day 7（黑客松答辩打磨）
- 学习重点：赛道对齐表达、风险与路线图。
- 执行任务：
  - 录制 3-5 分钟演示。
  - 完成“已达成/未达成/下一步”答辩稿。
- 验收标准：
  - 评委可在 3 分钟内看懂核心价值与技术可信度。

## 执行记录

### Day 1 实际执行结果（2026-02-26）
- `node -v` -> `v24.10.0`
- `npm -v` -> `11.6.1`
- `sui --version` -> `1.66.2-a9a6825eaf62`
- `npm run lint` -> PASS
- `npm run test` -> PASS（backend 15/15，frontend 3/3）
- `sui move test --path contracts/safety_middleware` -> PASS（2/2）

### Day 2 已提前执行部分（2026-02-26）
- 已修复 Move warning：
  - `audit.move` 去除重复 alias/unused use。
  - `policy.move` 引入错误码常量 `E_NOT_OWNER`。
  - `policy_tests.move` 使用 `location = safety_middleware::policy` 精确断言。
- 复测：`sui move test --path contracts/safety_middleware` -> PASS（2/2，无 warning）。

## 下一步（立即执行）
- 进入 Day 3：后端风控约束补齐（异常输入全覆盖 + 错误语义文档化）。

### Day 3 已提前执行部分（2026-02-26）
- 新增后端反例测试：
  - `precheck.test.mjs`：空白名单、零限额。
  - `routes.test.mjs`：空白名单请求返回 `400 invalid_input`。
- 复测：
  - `npm run --workspace apps/backend test` -> PASS（18/18）
  - `npm run lint` -> PASS

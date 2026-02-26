# 公链 AI 分析工具推荐（Sui 优先）

更新时间：2026-02-25

## 一、推荐组合（新手优先）
1. ChatGPT / Codex：做研究框架、假设清单、提示词迭代。
2. DefiLlama：看 TVL/Volume/Stablecoin/Fees 的全链快照。
3. Dune：做 SQL 自定义看板（地址、交易、协议行为拆解）。
4. Flipside：做 Sui 生态 SQL 分析与可复用查询。
5. Sui Directory + Sui Docs：补生态地图与技术事实校验。

## 二、每个工具的角色
- ChatGPT/Codex：
  - 输出“问题定义 -> 指标体系 -> 结论”的结构。
  - 自动生成查询问题与周报摘要。
- DefiLlama：
  - 宏观判断资金和交易热度。
  - 适合做竞品横向对比。
- Dune：
  - 适合验证“真实用户行为”，例如留存、重复交互、交易类型分布。
- Flipside：
  - 适合做 Sui 生态的深度数据分析模板。
- Sui Docs / Directory：
  - 用于校验技术口径和生态项目分类。

## 三、执行顺序（建议）
1. 先用 DefiLlama 做 30 分钟宏观扫描。
2. 再用 Sui Docs 确认技术事实（对象模型、Move、PTB、tokenomics）。
3. 再用 Dune/Flipside 拉 30 天数据，补齐活跃地址和交易细分。
4. 最后用 ChatGPT/Codex 生成“结论 + 风险 + MVP 建议”。

## 四、注意事项
- 所有数字都必须标注日期和口径（例如 24h/7d/30d）。
- 至少 2 个来源交叉验证再下结论。
- 把“事实”和“推断”分开写，避免误导。

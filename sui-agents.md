
一、认知阶段
认知结构化

新建md，1、将文件名改成sui任务.md 2、你阅读理解任务，并且在文件内改写成中英双语模式的文字 3、面对这个任务，你开始用superpowers这个工具，给我体验一下
我会先按仓库规则启用 using-superpowers 和 brainstorming 两个技能，然后完成三件事：重命名文件、理解你的任务意图、把任务改写成中英双语内容写入文件。
Explored 1 file
我已经完成技能检查。现在先确认当前文件状态，再执行重命名和内容改写；如果目标文件已存在，我会安全覆盖你刚创建的这份任务文档内容。
Ran if [ -f new.md ]; then echo '---new.md---'; sed -n '1,120p' new.md; fi; if [ -f 'sui任务.md' ]; then echo '---sui任务.md---'; sed -n '1,120p' 'sui任务.md'; fi
Explored 1 list
我将开始改文件：先把 new.md 重命名为 sui任务.md，再把原始英文任务整理成结构化的中英双语版本写入同一文件。
Ran mv new.md 'sui任务.md'
Ran cat > 'sui任务.md' <<'EOF' # Sui Hackathon Task Brief | Sui 黑客松任务说明 ## 1) Mission | 任务目标 **中文**： OpenClaw 的核心能力是让 AI 在本地环境中执行命令、控制浏览器并完成实际操作。你的任务是从两个方向中选择其一： 1. 打造更强的自治代理能力。 2. 构建安全防护机制，让代理在处理钱包和敏感操作时可被信任。 **English**: OpenClaw enables AI to execute local commands, control browsers, and perform real actions. Your mission is to choose one of two directions: 1. Build a more capable autonomous operator. 2. Build strong security safeguards so agents can be trusted with wallets and sensitive operations. --- ## 2) Track A: Safety & Security | 赛道 A：安全与防护 **中文**： 你拥有接近 root 级别的系统能力，风险同样很高。重点是为代理建立“免疫系统”，避免被恶意输入、错误执行或密钥泄露击穿。 可选方向示例： - 钱包隔离层：代理只提议交易，由硬件钱包最终签名执行。 - 注入攻击过滤：在网页、邮件等外部输入进入代理前做安全清洗。 - 自加固脚本：自动配置防火墙、加密密钥、建立版本追踪。 - 行为证明链：将关键推理/执行步骤上链留痕（可配合隐私加密）。 **English**: You have near root-level machine access, which creates major risk. The goal is to build an “immune system” against prompt injection, execution abuse, and secret leakage. Example directions: - Wallet air-gap: the agent proposes transactions, hardware wallet signs. - Injection hunter: sanitize external content before the agent consumes it. - Self-hardening script: auto-configure firewall, encrypted secrets, version traceability. - Cryptographic traceability: publish verifiable execution/reasoning proofs with privacy controls. --- ## 3) Track B: Local God Mode | 赛道 B：本地全能代理 **中文**： 目标是构建长期在线、能主动处理任务的本地 AI 助手，结合终端与浏览器控制能力，减少人工重复操作。 可选方向示例： - 数字管家：自动整理文件、批处理格式转换、仓库同步与备份。 - 自动化执行专家：处理复杂网页流程（登录、表单、预约、企业门户等）。 - 代理协作网络：在 Sui 生态上实现代理之间通信、支付与任务协同。 **English**: The goal is an always-on local assistant that proactively handles machine chores using terminal and browser control. Example directions: - Deep-clean butler: auto-organize files, run local transforms, sync repos, backup intelligently. - Web workflow sniper: automate complex login/form/booking/intranet procedures. - Agent social layer: enable inter-agent communication, payments, and collaboration on Sui. --- ## 4) Prizes | 奖励机制 **中文**： - 总奖池：20,000 美元 - 赛道 A：前 5 名，各 1,900 美元 - 赛道 B：前 5 名，各 1,900 美元 - 社区人气奖：5 个名额，各 200 美元 - 支付方式：Sui 链上 USDC **English**: - Total pool: USD 20,000 - Track A: Top 5, USD 1,900 each - Track B: Top 5, USD 1,900 each - Community Favorite: 5 winners, USD 200 each - Payment: USDC on Sui --- ## 5) Judging Process | 评审流程 **中文**： 1. 初筛：每个赛道先筛选 Top 10，并发布公开审计/评估。 2. 交叉投票：A 赛道候选评 B 赛道，B 赛道候选评 A 赛道，产出各自 Top 5。 3. 社区票选：非赛道 Top 5 项目参与社区人气奖竞争。 **English**: 1. Shortlist: top 10 per track with public audit-style reviews. 2. Cross-track voting: Track A votes on Track B shortlist, and vice versa. 3. Community Favorite: projects not already in track top-5 compete for community awards. --- ## 6) Eligibility | 参赛资格 **中文**： - 需在 DeepSurge 正式提交。 - 项目需在黑客松开始后由 AI 代理主导开发。 - 至少使用一个 Sui 技术组件。 - 需可演示、可验证。 - 需完善 DeepSurge 资料并绑定钱包地址。 **English**: - Must be submitted via DeepSurge. - Built by AI agents (or mostly by AI agents) after hackathon start. - Must use at least one Sui stack component. - Must provide a verifiable working demo. - Must have a complete DeepSurge profile with wallet address. --- ## 7) Actionable Next Step | 可执行下一步 **中文**： 先确定你要投哪条赛道（安全防护 or 本地自动化），再在 1 页内写出你的 MVP： - 核心问题 - 关键能力 - 技术栈（Sui 组件） - 演示路径 - 风险与防护 **English**: Pick your primary track first (Security vs Local Automation), then define a one-page MVP: - Core problem - Key capabilities - Sui components - Demo path - Risks and safeguards EOF
内容已经完成改写，我再做一次快速校验，确认文件名和中英双语内容都已落盘。
已完成你这 3 项要求：
文件已重命名为：/Users/yhb/Desktop/sui-agents/sui任务.md
我已阅读原任务内容，并改写为结构化中英双语版本（按 Mission、赛道、奖励、评审、资格、下一步组织）。
已按 superpowers 流程体验执行：先加载 using-superpowers，再加载 brainstorming，然后再进行文件操作与内容改写。
如果你要，我下一步可以继续用 superpowers 给这份任务直接产出一版「可提交的项目提案（中英双语）」并写进同一个文件。
1、AI 搜索
sui的全景分布图
分析公链模版.md
分析公链工具：codex
2、AI 分析
头脑风暴工具：superpowers
头脑风暴模版.md

这是做一个什么样的可执行系统？
这个体系系统关键轴承、模块、数据流是什么样的，可替换点在哪里？
发布此次任务是需要在sui的生态中赋予什么意义和目标？
从什么入手穿透这次任务？

3、AI 提示图

根据穿透的想法，发布提示图
提示图模板.md
提示图工具：codex

4、AI 点评/提示图迭代优化
ai互相点评提示图，确定demo原型
点评工具：豆包review

5、确定提示图



二、执行阶段
分阶段验收提示图

1、第一步：

问题排查
单元测试

提交版本
下一步ai review
2、第二步：

问题排查
单元测试
提交版本
下一步ai review

3、第三步：

问题排查
单元测试

提交版本

4、提示图回顾

工具codex

5、部署上线



三、复盘阶段
1、注意事项
1、涉及到人为给的信息，需要交给ai审查通过✅
2、对于问题排查细节，需要整体统计问题出处、成因、解决方法
3、任务完成后要ai对提示图整体完成情况做出评测：已完成、部分完成、未完成、下一步建议
4、对任务中涉及到小功能、小插件的实现需要进行类目统计
5、注重完善任务项目的生命周期管理
6、注意数据流的不同情况处理，线上/本地
7、注重细节管理：releases/tag
8、完成需要对任务进行抽象总结
9、逆向思维拆解体系、关键轴承、模块、数据流、可替换点







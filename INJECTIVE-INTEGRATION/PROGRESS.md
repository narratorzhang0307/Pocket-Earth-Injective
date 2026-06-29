# PROGRESS.md — Injective × Pocket Earth 断点续作清单

> **恢复指南：下次醒来先读本文件，再读 PLAN.md / RESEARCH.md，然后从「下一步」继续。**
> 状态标记：`[ ]` 待办 · `[~] ` 进行中 · `[x]` 完成。
> 工作根：`/Users/zhangcheng/Desktop/Pocket-Earth-Injective`（副本，与线上原项目隔离）。
> 集成笔记/代码根：`/Users/zhangcheng/Desktop/Pocket-Earth-Injective/INJECTIVE-INTEGRATION/`

---

## 👉 当前状态：🎉🎉 真·上链全跑通 + GitHub 参赛仓库就绪（2026-06-29）

**最新里程碑**：
- ✅ **GitHub 参赛仓库**：公开仓库已就绪并持续推送：`https://github.com/narratorzhang0307/Pocket-Earth-Injective`；本地 `main` 跟踪 `origin/main`。
- ✅ **真·链上身份**：Frost 注册成功 agentId 43；又批量注册 4 个不同口味 agent（44 拉美文学旅人 / 45 黑色电影迷 / 46 爵士夜行者 / 47 北欧极光客），口味用 **data: URI 内联上链**（无需 Pinata），8004 身份 tuple 可查；`verify-fleet.mjs` 会校验名片只含公开字段。
- ✅ **真·握手合约**：`SocialHandshake` 部署到 testnet `0xe5338a162a44a685201e1f6120b1a851949e3aee`；部署 tx `0x6048425a…`（比赛钱包 nonce 2）；真握手上链 tx `0x0e597f33…`（agentA 43 · agentB 44 · score 88 · 非零名片哈希）。
- ✅ **前端无人值守验证**（`npm run verify:plaza` 自动起停 Vite）：puppeteer 走查 public-plaza 读链上 agent、agent-plaza 页面与「咖啡地图」安装闭环；证据包里的 `plazaFlow` 已明确 public-plaza = 链上社交发现、agent-plaza = agent 市集/安装闭环；广场前端直接用 `/api/injective?tool=list-agents&builderCode=pocket-earth` 按 builderCode 读取 `agentId 43–47`，口味解码、相似度差异化排序（79/73/67）、钉地球、夜间报告，UI 与现有像素风协调。验证中修了 4 个真实问题：①list-agents 扫全链 14s → 并行快查 2.6s；②空 agentId 拖慢 → getStatus 2.5s 超时；③相似度一排全 55% → 差异化算法；④定位 demoReset 刷新清画像。
- ✅ **链上证据脚本**：`CHAIN-EVIDENCE.md` 汇总评审可直接点击的身份、钱包、注册交易、合约、握手证据；`chain-proof-data.mjs` 集中维护钱包、IdentityRegistry、SocialHandshake、评审简报、评审主链接、评审核验清单、比赛对齐清单、提交入口清单、提交要求清单、隐私边界清单、plaza 演示流和 7 笔时间线交易，供产品 API 与验证脚本共用；项目后端提供 `/api/injective?tool=get-chain-evidence` 输出标明 `testnet / chainId 1439 / readOnly / publicOnly` 的公开证据包，并内含 `reviewBrief`、`reviewLinks`、`reviewChecklist`、`competitionAlignment`、`submissionLinks`、`submissionChecklist`、`recordingOrder`、`privacyBoundary`、`plazaFlow`、`npm run verify:demo` / `npm run verify:duration` / `npm run verify:evidence` / `npm run verify:public-proof` / `npm run verify:github` / `npm run verify:source` / `npm run verify:registry` / `npm run verify:pitch` / `npm run verify:brief` / `npm run verify:review` / `npm run verify:review-links` / `npm run verify:recording-order` / `npm run verify:plaza-flow` / `npm run verify:nova-alignment` / `npm run verify:submission` / `npm run verify:injective` 复验命令与 `list-agents` / `get-wallet-timeline` API 路径；`npm run verify:duration` 可解析 DEMO-SCRIPT 分镜时间轴，防止录屏超过 180s / 3 分钟提交限制；`npm run verify:evidence` 可快速离线冒烟这个公开证据包；`npm run verify:public-proof` 会把公开证据包当成评审可展示契约，集中检查字段白名单、公开 URL、复验命令、旧仓库误指和私钥/本地路径泄露；`npm run verify:github` 会确认 `origin/main`、GitHub 公开仓库状态、远端 README / 集成说明 / 证据包 / 录屏脚本都仍属于 `Pocket-Earth-Injective`；`npm run verify:source` 会确认公开证据 API 锚到当前仓库、`main` 和本地 HEAD 提交；`npm run verify:registry` 会读取 ERC-8004 Registry 的 `Transfer(0x0 -> owner, tokenId)` mint 事件，单独确认 `agentId 43-47` 的注册交易哈希、区块和同一 owner 钱包；`npm run verify:pitch` 会确认 PPT 备注仍以 Injective 链上证据为主，硬件 Frost Buddy 只作为边界清楚的延展，并核验 Raspberry Pi 外部来源；`npm run verify:brief` 可防止评审简报偏离 Injective 核心价值、比赛主题和公开复验路径；`npm run verify:review` 可防止评审清单里的公开链接 key 和本地复验命令漂移；`npm run verify:review-links` 可从产品 API 读取 `reviewLinks` 并逐项打开 Injective Blockscout，防止评审主链接漂移或失效；`npm run verify:recording-order` 可按证据包里的录屏顺序打开 #43、钱包页和三个只读产品 API，防止录屏路径漂移；`npm run verify:plaza-flow` 可固定 public-plaza = 链上社交发现、agent-plaza = agent 市集/安装闭环，防止 plaza 演示分组混淆；`npm run verify:nova-alignment` 可固定 AI 社交、Injective 链上执行层、Agent × 物理世界硬件延展和隐私公开证明之间的比赛叙事映射；`npm run verify:submission` 可固定 GitHub 参赛仓库、线上 `?demo` 入口、三个公开 API 复验路径和提交要求清单不误指旧仓库；`npm run verify:demo` 串起证据包、公开证据契约、GitHub 仓库公开性、pitch 备注、评审简报、3 分钟脚本守门、`builderCode=pocket-earth` agent fleet 读回、Registry mint 事件、Blockscout 链接检查、录屏顺序检查、plazaFlow 分组检查、比赛对齐检查、提交入口和提交要求清单检查，作为录屏前的链上证据快检；另提供 `/api/injective?tool=get-wallet-timeline` 只读接口供演示/评审从产品 API 读取同一条链上时间线；`verify-agent43.mjs` 可读回 `builderCode: pocket-earth` 并核验 #43、钱包页、握手合约页；`verify-chain-timeline.mjs` 可直接读 Injective RPC 的交易、receipt 和 block timestamp，复验注册→部署→fleet→握手的时间线；`verify-handshake-contract.mjs` 可核验 SocialHandshake 部署交易/部署者/部署时序，并重编译 `SocialHandshake.sol` 比对 Injective testnet creation/runtime bytecode；`verify-handshake.mjs` 可重算脱敏名片哈希并解码真实握手 calldata + event（agentA 43 · agentB 44 · score 88 · 非零名片哈希）。
- ✅ **评审 60 秒入口**：`JUDGE-QUICKSTART.md` 已把 `agentId 43`、钱包页、公开证据 API、builderCode fleet API、钱包时间线 API 和本地复验命令压成一页路径；`npm run verify:judge` 已接入 `verify:demo` / `verify:injective`，防止评审入口漂移、误指旧仓库或泄露非公开字段。
- ✅ **钱包时间线独立守门**：`npm run verify:wallet` 已单独核验 `/api/injective?tool=get-wallet-timeline` 返回的注册、SocialHandshake 部署、fleet 注册和真实握手交易序列，确认产品 API 输出与 Injective RPC 事实表一致且 public-only。
- ✅ **源码锚点守门**：`/api/injective?tool=get-chain-evidence` 已返回 `sourceControl`（GitHub 仓库、`main` 分支、当前提交和 commit URL）；`npm run verify:source` 会确认公开证据 API 锚到当前 `Pocket-Earth-Injective` checkout，防止评审看到的链上证据和代码提交脱节。
- ✅ **Registry mint 独立守门**：`/api/injective?tool=get-chain-evidence` 已公开返回 `registryMintEvents`，直接列出 `agentId 43-47` 的 mint from、owner、交易哈希、区块号、tx 链接和身份页；`reviewChecklist` 已加入 `registry-mint-events` 独立检查项；`npm run verify:registry` 已作为一等复验入口，读取 ERC-8004 Registry mint 事件并确认这些字段和 Blockscout 身份页。
- ✅ **Frost Buddy 硬件桥**：`hardware/frost-buddy/` 已加入解耦事件契约，把 `music-agent` 播放和 public-plaza 读到的 Injective 链上见闻转成安全 JSONL，供 Raspberry Pi / BLE / TTS 适配；已只读研究 Claude 的 Sunset Radio Pi skill-agent worktree，并在本仓库落地 `raspi/frost_pi_skill_agent.py`，用白名单技能路由把松散语音映射为音乐命令或 `chain_dispatch` 公开事件；`verify-hardware-bridge.mjs` 已接入 `npm run verify:injective`，确认不带私钥、密钥名、画像原文或名片哈希。
- ✅ **demo 预置画像**：`?demo` 参数清零后自动注入示例口味画像，录 demo 一进广场就丰满（`demoReset.ts`）。
- ✅ **交付物**：`.gitignore` 加固（私钥/第三方库不入库）、`.env.example` 补 INJ_ 说明、`DEMO-SCRIPT.md`（3 分钟分镜 + 链上验证凭证 + `verify:duration` 时长守门）、`register-fleet.mjs` / `verify-plaza*.mjs` / `verify-agent43.mjs` / `verify-handshake-contract.mjs` / `verify-handshake.mjs` 复现工具。
- ⏳ **继续打磨**：优先优化 public-plaza / agent-plaza 演示、README 评审入口、轻量 smoke、链上证据可读性和录屏稳定性。

---

## 👉 历史状态：P0 架构全完成 + build 净，真·上链等用户私钥

**已完成（不需私钥的全部做完）**：P0-0/1/2/3/5/6/7/8 + `npm run build` ✓（37s 编译净）。P1-1 合约 `SocialHandshake.sol` 已写（部署待私钥）；**P1-2 握手服务端骨架 dryRun 已验通**（`?tool=handshake` 返回 willEmit，真写 viem writeContract 已就位、待私钥+合约地址）。
- 全链路打通：passport 脱敏名片 → `/api/injective`(server.mjs + vite 双挂) → 真连 testnet(ping reachable) → 广场读链上 agent(空回落示意不白屏) → 钉地球(agent 标记类型) → 夜间「Injective 链上见闻」报告。

**下一步分两种情况**：
1. **常规自动化**：每轮在 `Pocket-Earth-Injective` 内做一个小而真实的改进，验证后提交并推送 `origin/main`；不要碰旧仓库、不要 force push、不要改可见性。
2. **继续上链能力**：若要增加新的写链能力，优先做足迹存在性凭证或声誉互评；仍坚持 testnet-only、隐私原文不上链、写操作显式确认。

> 【不依赖私钥项已 100% 完成：P0 全 + P1-1 合约 + P1-2 握手骨架 + P1-3 读声誉 + Demo/Pitch + README + build 净 + 真连 testnet。后续 cron 触发若 .env 仍无私钥，请直接快速确认后停、勿再找边际项空转。】
>
> **cron 续作判断**：先 `grep INJ_PRIVATE_KEY= 副本/.env` —— 有 0x 值则做 P0-4 真上链(去 register 的 dryRun)+部署合约；**无值则不依赖私钥的项已全做完、本轮无新可做项，快速确认后停**(不重复劳动)，等用户配私钥。

**当前外部阻塞**：无 GitHub 创建/推送阻塞。若后续写链失败，再检查 testnet gas、RPC、`.env` 中的 `INJ_PRIVATE_KEY` 和 `INJ_HANDSHAKE_CONTRACT`。

### ✅ 已完成里程碑（2026-06-27 凌晨）
- **SDK 安装方式修正**：`@injective/agent-sdk` **npm 未发布(E404)**，改本地 build——`INJECTIVE-INTEGRATION/_research/repos/injective-agent-sdk/packages/sdk` 跑 `npm i + npm install viem@~2.47.6 + npm run build` 出 dist，副本根 `npm install file:<该 sdk 路径> viem@~2.47.6` 装入。SDK import 全导出可用(AgentClient/AgentReadClient/PinataStorage/CustomUrlStorage/TESTNET…)。**复现命令见本文件底部「SDK 安装」。**
- **真连 Injective testnet**：`PORT=3019 node server.mjs` 后 `curl '/api/injective?tool=ping'` → `{reachable:true,sdk:true,network:testnet}`；`/healthz` 含 `injective:testnet:read-only`。
- 已写文件：`src/app/lib/injective/passport.ts`(P0-1 脱敏名片)、`injective-service.mjs`(P0-2 服务: ping/list-agents/get-status/register+dryRun闸门)、`server.mjs`(挂 import+INJ_CFG+路由+healthz 共 4 处)。
- list-agents 路由通(testnet registry 当前 agent 少/响应慢，前端务必回落示意，见 P0-6)。

---

## 已 clone 库位置（只读，已就位）
- ERC-8004 身份 SDK（主依赖来源）：`INJECTIVE-INTEGRATION/_research/repos/injective-agent-sdk`（`@injective/agent-sdk@0.2.1`，commit 381a270）。源码精读见 RESEARCH.md §1。
- iagent（**不引入**，仅作 Boundary 命名空间蓝本）：`INJECTIVE-INTEGRATION/_research/repos/iagent`
- injective-ts（参考）：`INJECTIVE-INTEGRATION/_research/repos/injective-ts`
- 已写文档：`INJECTIVE-INTEGRATION/{RESEARCH.md, PLAN.md, PROGRESS.md}`

---

## P0 有序小步骤（每步可独立完成）

### 准备
- [x] **P0-0** 装依赖：`npm install @injective/agent-sdk viem`；确认 ESM（`"type":"module"`）。验收：`node -e "import('@injective/agent-sdk').then(m=>console.log(Object.keys(m)))"` 能列出 AgentClient/AgentReadClient。

### Taste Passport（无需私钥）
- [x] **P0-1** 新建 `src/app/lib/injective/passport.ts`：组装脱敏 Taste Passport（`getProfileSummary`+`getCachedTasteLine`+`profileFingerprint`，**只导 top-K tag 字符串、不导 n 计数**）。验收：控制台打出 passport JSON，grep 不到原文/n。守 profile.ts:4/:7 红线。

### 后端路由（只读部分无需私钥）
- [x] **P0-2** `server.mjs`：顶部加 `const INJ_PK = process.env.INJ_PRIVATE_KEY||''`、`INJ_NETWORK='testnet'`（照 DASHSCOPE_KEY :33）；写 `async function handleInjective(req,res,url)` 按 `?tool=` 分发 `ping/register/list-agents/get-status/dispatch`（照 handleTravelMcp :283）；主路由 `:388` 区加 `if (p === '/api/injective') return await handleInjective(req,res,url)`（照 :392）；`/healthz`（:393）加 inj 状态。验收：`curl 'localhost:PORT/api/injective?tool=ping'` 返回 reachable。
- [x] **P0-3** `vite.config.ts`：`configureServer` 内（:19-20 旁）加 `server.middlewares.use('/api/injective', ...)`。验收：dev 模式同 prod 打通。**别忘这步，否则 dev 断。**
- [x] **P0-5** `?tool=list-agents`/`get-status`：用 `new AgentReadClient({network:'testnet'})` 读 registry。验收：返回链上真实 agent JSON（无需私钥即可跑）。

### 上链注册（需用户私钥 → 见阻塞区；可先 dryRun）
- [x] **P0-4** `?tool=register`：服务端 `new AgentClient({privateKey:INJ_PK,network:'testnet',storage})` → `register({name,type:'other',builderCode:'pocket-earth',wallet:client.address,description:Passport,services:[{name:'MCP',endpoint:...}],tags})`。**先 `dryRun:true` 验通**（返回模拟 agentId+gasEstimate，不上链），用户私钥到位后去掉 dryRun 真上链。验收：dryRun 返回结构正确；真上链后 8004scan 可见。

### 前端广场 + 地图（无需私钥）
- [x] **P0-6** `src/app/data/mapMarkers.ts`：`MarkerKind`(:14) 加 `'agent'`，`MARKER_KINDS`(:28)/`KIND_COLOR`(:37) 加配色；`PublicPlazaPage.tsx` `neighbors` useMemo(:66-91) 改读 `/api/injective?tool=list-agents`，**失败回落现有示意（不白屏）**。验收：广场显示真实链上 agent，断网回落。
- [x] **P0-7** 链上 agent `markPlace({kind:'agent',prefix:'uag-',key:agentId,label,geo,meta:{agentId,cardUri,scanUrl,injAddr}})`（markPlace.ts:34）钉地球；详情卡渲染 scanUrl 外链。验收：地球出现 agent 点，点开有链接，spreadCoord 抖散不重叠。

### Nightly Dispatch 面板（无需私钥）
- [x] **P0-8** Dispatch 面板（手动触发）：`?tool=dispatch` 拉 listAgents → 经 `/api/frost-llm`(Qwen) 折叙事 → App 内渲染；（可选）经 memoryRouter L5 回流。验收：面板出一段「今夜遇见 N 个 agent」报告。

### 收尾
- [x] **P0-9** 端到端走查 Demo 5 幕（PLAN §6）；build 净（`npm run build`）；按记忆习惯 `[Plus]` 提交；参赛仓库已推送到 `origin/main`。

---

## 配置与风险（单列）
> 下列项不是当前 GitHub/演示阻塞；只有继续做新的写链功能时才需要复查。

- [x] **U-1 Injective testnet EVM 私钥**：副本 `.env` 已配置 `INJ_PRIVATE_KEY`（只在 server 端读，绝不打印，绝不进前端 bundle）。
- [x] **U-2 testnet INJ gas**：已完成身份注册、合约部署和真实握手交易；后续写链失败时再查余额。
- [~] **U-3 Pinata JWT（可选）**：当前 demo 使用 data URI 内联名片，无 Pinata 也可复现；需要 IPFS 版本时再补。
- [x] **U-4 确认网络**：默认 testnet（chainId 1439），比赛 demo 用 testnet。
- [ ] **U-5（仅 P2 x402）**：确认收款 stablecoin + facilitator 是否在 Injective 链结算（x402 facilitator 默认 Base，需核实）。

---

## P1 / P2 待办（概要，细节见 PLAN §5）
- [x] **P1-1** `SocialHandshake.sol`（~15 行）+ hardhat 部署 testnet（network `{url:RPC,chainId:1439,accounts:[PK]}`）。
- [x] **P1-2** `?tool=handshake` viem `writeContract` emit + Boundary `inj_handshake` 校验器。
- [~] **P1-3** 读部分 `?tool=get-reputation`(getReputation) 已加 ✅、无需私钥；写部分 `giveFeedback` 互评待私钥。
- [ ] **P1-4** 足迹存在性凭证（钉点哈希+时间戳上链，不上坐标原文）。
- [ ] **P2-1** 先验 x402 facilitator 支持 Injective；`x402:true` + 付费路由中间件 + `inj_tip` 限额校验器。
- [~] **P2-2** Nightly Dispatch 经 BLE 推桌面硬件 Frost（已完成安全 JSONL 事件桥；真实 BLE/TTS adapter 待硬件进程）。
- [~] **P2-3** 树莓派常驻播报端（已预留 Raspberry Pi / BLE / TTS 接口；常驻 daemon 与实体调试待做）。

---

## 关键约束备忘（每次续作前过一遍）
1. 隐私原文绝不上链；只导 top-K tag、不导 n（profile.ts:4/:7）。
2. 私钥只在 server.mjs 服务端 .env，绝不进前端 bundle。
3. 写操作过 Boundary（validator.ts `registerActionValidator('inj_*')`，testnet-only+白名单+二次确认）；加动作前先放宽 RadioAction 类型（validator.ts:6-7）。
4. `server.mjs` + `vite.config.ts` **两处都要挂** `/api/injective`。
5. 读/写链失败回落、不白屏。
6. 提交按记忆习惯：`[Plus]` 前缀、推当前参赛仓库 `origin/main`；绝不碰旧仓库、绝不 force push。
7. 模型只用 Qwen（不引入 iagent/OpenAI）。
8. 全程在副本 `/Users/zhangcheng/Desktop/Pocket-Earth-Injective` 操作，与线上原项目隔离。

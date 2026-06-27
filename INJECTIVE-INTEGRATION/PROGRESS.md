# PROGRESS.md — Injective × Pocket Earth 断点续作清单

> **恢复指南：下次醒来先读本文件，再读 PLAN.md / RESEARCH.md，然后从「下一步」继续。**
> 状态标记：`[ ]` 待办 · `[~] ` 进行中 · `[x]` 完成。
> 工作根：`/Users/zhangcheng/Desktop/Pocket-Earth-Injective`（副本，与线上原项目隔离）。
> 集成笔记/代码根：`/Users/zhangcheng/Desktop/Pocket-Earth-Injective/INJECTIVE-INTEGRATION/`

---

## 👉 当前状态：🎉🎉 真·上链全跑通 + 前端验证 + Demo 就绪（2026-06-27）

**最新里程碑**：
- ✅ **真·链上身份**：Frost 注册成功 agentId 43；又批量注册 4 个不同口味 agent（44 拉美文学旅人 / 45 黑色电影迷 / 46 爵士夜行者 / 47 北欧极光客），口味用 **data: URI 内联上链**（无需 Pinata），8004 身份 tuple 可查。
- ✅ **真·握手合约**：`SocialHandshake` 部署到 testnet `0xe5338a162a44a685201e1f6120b1a851949e3aee`；真握手上链 tx `0xce15c72f…`（agentA 43 · agentB 44 · score 88）。
- ✅ **前端无人值守验证**（puppeteer 走查广场）：广场读链上 agent、口味解码、相似度差异化排序（79/73/67）、钉地球、夜间报告，UI 与现有像素风协调。验证中修了 4 个真实问题：①list-agents 扫全链 14s → 并行快查 2.6s；②空 agentId 拖慢 → getStatus 2.5s 超时；③相似度一排全 55% → 差异化算法；④定位 demoReset 刷新清画像。
- ✅ **demo 预置画像**：`?demo` 参数清零后自动注入示例口味画像，录 demo 一进广场就丰满（`demoReset.ts`）。
- ✅ **交付物**：`.gitignore` 加固（私钥/第三方库不入库）、`.env.example` 补 INJ_ 说明、`DEMO-SCRIPT.md`（3 分钟分镜 + 链上验证凭证）、`register-fleet.mjs` / `verify-plaza.mjs` 复现工具。副本已 git init + 本地 commit。
- ⏳ **待用户**：在 GitHub 建公开仓库后 push（推送 / 改可见性由用户操作）。

---

## 👉 历史状态：P0 架构全完成 + build 净，真·上链等用户私钥

**已完成（不需私钥的全部做完）**：P0-0/1/2/3/5/6/7/8 + `npm run build` ✓（37s 编译净）。P1-1 合约 `SocialHandshake.sol` 已写（部署待私钥）；**P1-2 握手服务端骨架 dryRun 已验通**（`?tool=handshake` 返回 willEmit，真写 viem writeContract 已就位、待私钥+合约地址）。
- 全链路打通：passport 脱敏名片 → `/api/injective`(server.mjs + vite 双挂) → 真连 testnet(ping reachable) → 广场读链上 agent(空回落示意不白屏) → 钉地球(agent 标记类型) → 夜间「Injective 链上见闻」报告。

**下一步分两种情况**：
1. **用户私钥到位后**（U-1/U-2）：做 **P0-4**（register `dryRun:true`→去掉真上链，8004scan 可见）+ **P1-1 部署**（hardhat 部署 SocialHandshake 到 testnet chainId 1439）+ **P1-2**（handshake 服务端 viem `writeContract`）。
2. **私钥未到位时可先推进的不依赖项 — 已全部完成** ✅：P1-2 handshake 骨架(dryRun 验通)、集成 README、Demo 5 幕+Pitch(PLAN §6/§7)、SocialHandshake 合约。

> 【不依赖私钥项已 100% 完成：P0 全 + P1-1 合约 + P1-2 握手骨架 + P1-3 读声誉 + Demo/Pitch + README + build 净 + 真连 testnet。后续 cron 触发若 .env 仍无私钥，请直接快速确认后停、勿再找边际项空转。】
>
> **cron 续作判断**：先 `grep INJ_PRIVATE_KEY= 副本/.env` —— 有 0x 值则做 P0-4 真上链(去 register 的 dryRun)+部署合约；**无值则不依赖私钥的项已全做完、本轮无新可做项，快速确认后停**(不重复劳动)，等用户配私钥。

**阻塞·需用户**：testnet 私钥 → 副本 `.env` 的 `INJ_PRIVATE_KEY`（仅 testnet，勿用主网）+ [水龙头](https://testnet.faucet.injective.network/)领币付 gas。详见下方「阻塞」区 U-1/U-2。
（P0-9 的 commit/push 策略留用户回来定：副本独立、无 .git，原项目全程未碰。）

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
- [ ] **P0-9** 端到端走查 Demo 5 幕（PLAN §6）；build 净（`npm run build`）；按记忆习惯 `[Plus]` 提交推**私有 origin（Pocket-Earth-Plus）**，**绝不推公开仓库**。

---

## 阻塞：需用户（单列）
> 这些到位前，P0-4 真上链、P1/P2 写操作无法完成。**但 P0 其余步骤不依赖这些，先做完。**

- [ ] **U-1 Injective testnet EVM 私钥**（`0x...`，仅 testnet、勿用主网密钥）→ 写进副本 `.env` 的 `INJ_PRIVATE_KEY`（server 端读，绝不进前端 bundle）。同一私钥既当 operator 又当 agent wallet（SDK 仅支持自签绑定，client.ts:254）。
- [ ] **U-2 testnet INJ gas**：用 U-1 地址去水龙头领 `https://testnet.faucet.injective.network/`（付 register/发事件的 gas）。
- [ ] **U-3 Pinata JWT（可选）**：`https://app.pinata.cloud` 免费申请 → `PINATA_JWT`，自动把 Agent Card 传 IPFS。**不想用 IPFS 可改 `CustomUrlStorage('https://pocket-earth.throughtheglass.art/card.json')` 自托管**（构造入参是裸字符串，storage/custom-url.ts:3）。
- [ ] **U-4 确认网络**：默认 testnet（chainId 1439）——确认 demo/比赛用 testnet 即可，无需额外动作。
- [ ] **U-5（仅 P2 x402）**：确认收款 stablecoin + facilitator 是否在 Injective 链结算（x402 facilitator 默认 Base，需核实）。

---

## P1 / P2 待办（概要，细节见 PLAN §5）
- [x] **P1-1** `SocialHandshake.sol`（~15 行）+ hardhat 部署 testnet（network `{url:RPC,chainId:1439,accounts:[PK]}`）。
- [x] **P1-2** `?tool=handshake` viem `writeContract` emit + Boundary `inj_handshake` 校验器。
- [~] **P1-3** 读部分 `?tool=get-reputation`(getReputation) 已加 ✅、无需私钥；写部分 `giveFeedback` 互评待私钥。
- [ ] **P1-4** 足迹存在性凭证（钉点哈希+时间戳上链，不上坐标原文）。
- [ ] **P2-1** 先验 x402 facilitator 支持 Injective；`x402:true` + 付费路由中间件 + `inj_tip` 限额校验器。
- [ ] **P2-2** Nightly Dispatch 经 BLE 推桌面硬件 Frost（`FrostSignals.chainEvent` 源 + derive 折 celebrate/heart/attention/dizzy）。
- [ ] **P2-3** 树莓派常驻播报端（可选）。

---

## 关键约束备忘（每次续作前过一遍）
1. 隐私原文绝不上链；只导 top-K tag、不导 n（profile.ts:4/:7）。
2. 私钥只在 server.mjs 服务端 .env，绝不进前端 bundle。
3. 写操作过 Boundary（validator.ts `registerActionValidator('inj_*')`，testnet-only+白名单+二次确认）；加动作前先放宽 RadioAction 类型（validator.ts:6-7）。
4. `server.mjs` + `vite.config.ts` **两处都要挂** `/api/injective`。
5. 读/写链失败回落、不白屏。
6. 提交按记忆习惯：`[Plus]` 前缀、推**私有 Pocket-Earth-Plus origin**、**绝不动公开仓库**；提交禁用词照旧。
7. 模型只用 Qwen（不引入 iagent/OpenAI）。
8. 全程在副本 `/Users/zhangcheng/Desktop/Pocket-Earth-Injective` 操作，与线上原项目隔离。

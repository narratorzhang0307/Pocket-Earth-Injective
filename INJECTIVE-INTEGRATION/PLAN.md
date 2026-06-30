# PLAN.md — Injective × Pocket Earth 融合方案

> 历史方案文档，已按当前 GitHub 交付和最终版 PPT 口径重写：Frost Passport + Agent Plaza + Nightly Chain Dispatch + Frost Edge Node。
> 阅读顺序：当前事实以 `README.md`、`INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md`、`INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md` 和五条只读 API 为准；本文只保留方案推演与 P1/P2 边界，不能替代公开证据包。
> 目标：把已经落地的 Injective 核心集成、公开核验、后续 P1/P2 边界讲清楚。务实可执行，不为 web3 而 web3。

---

## 0. 一句话方案

把 Pocket Earth 已有的「FROST 特使带长期口味画像出门社交、夜里回报告」叙事，**用 Injective ERC-8004 agent registry 接上真实对端**：用户的脱敏口味画像（Taste Passport）注册成链上 Agent Card（一枚 soulbound 身份 NFT），公共广场从「示意邻居」升级为「读链上真实 agent」，地图上钉出这些 agent 点，每晚 FROST 跑一趟把「在链上遇见了谁、收到什么」折成 Nightly Chain Dispatch 报告（可推到桌面硬件 Frost 播报）。**隐私原文永不上链，只上脱敏画像 + 哈希 + 时间戳；所有写操作过 Boundary；testnet-only。**

---

## 1. 文字架构图

```
┌─────────────────────────────── 端侧 / 链下（隐私原文留这里）────────────────────────────────┐
│                                                                                              │
│  用户行为(看电影/读书/听歌/旅行/记一笔)                                                      │
│        │  各 curator agent 跑完追加信号                                                       │
│        ▼                                                                                      │
│  profile.ts  ──► domains{tag,n} 5 域 · MAX 50/字段 · 只计数不存原文(:4,:7 红线)              │
│        │                                                                                      │
│        ├─ getProfileSummary()  ─┐                                                            │
│        ├─ getCachedTasteLine() ─┤  Taste Passport（脱敏：只导 top-K tag 字符串，不导 n）      │
│        └─ profileFingerprint() ─┘  → 内容寻址键/版本号（口味不变不重新上链）                  │
│                                                                                              │
│  memoryRouter.assembleMemory()  ◄── L5: getChainTrace()（链上身份/dispatch 摘要回流，脱敏）   │
│                                                                                              │
└──────────────────────────────────────────┬───────────────────────────────────────────────┘
                                            │  写操作必过这道闸
                                            ▼
                        ┌──────── Boundary：validator.ts ────────┐
                        │ registerActionValidator('inj_agent_register'|'inj_handshake')             │
                        │ Agent Plaza receipt validators（后续）                                      │
                        │ 校验：testnet-only · 权限白名单 · 二次确认 flag                            │
                        └──────────────────┬─────────────────────┘
                                           │ 仅放行「动作意图」，私钥绝不进前端
                                           ▼
         前端 injClient.fetch('/api/injective')  ──►  server.mjs handleInjective(?tool=)
                                                          │  服务端 .env 读 INJ_PRIVATE_KEY
                                                          │  （与 DASHSCOPE_KEY 同款服务端密钥模式 :33）
                                                          ▼
┌─────────────────────────────────────── 链上 / Injective testnet (chainId 1439) ──────────────┐
│                                                                                               │
│   @injective/agent-sdk (纯 viem)                                                              │
│   ├─ AgentClient.register({name,type,builderCode,wallet,description=Passport,services})       │
│   │     → soulbound 身份 NFT · agentId · identityTuple(eip155:1439:registry:id) · scanUrl     │
│   │     → Agent Card JSON 默认 data:application/json;base64 内联；可选托管只作为后续扩展       │
│   ├─ AgentReadClient.listAgents()/getAgentsByOwner()/getReputation()/watchRegistrations()     │
│   │     → 广场真实邻居 + 地图 agent 点 + Nightly Dispatch 素材                                  │
│   ├─ SocialHandshake 事件（已部署）：agentId / profileHash / score / timestamp                 │
│   └─ Agent Plaza 服务回执（P2：安装 / 调用 / 评价 / 可选付费）                                 │
│                                                                                               │
│   IdentityRegistry 0x8004A818…BD9e   SocialHandshake 0xe533…3aee                              │
│   握手事件：真实 SocialHandshake 已在 testnet 发出，可由 Blockscout / verify:handshake 复验     │
│                                                                                               │
└───────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                            │  链上事件 → derive 折态
                                            ▼
   App 内 PublicPlazaPage（FrostBuddy 特使 + 广场邻居 + 夜间报告）
   桌面硬件 Frost Buddy（BLE 桥推滚动文本 · 7 态：celebrate/attention/dizzy/heart）
```

---

## 2. 数据流（三条主链路）

### 2.1 出门（注册身份）
`profile.ts → Taste Passport(脱敏) → 前端发 'inj_agent_register' 意图 → Boundary 校验(testnet-only) → /api/injective?tool=register → server 用 INJ_PRIVATE_KEY 签名 → AgentClient.register → data URI Agent Card + ERC-8004 身份 → 返回 {agentId, identityTuple, scanUrl}` → 缓存到端侧（pe.inj.self.v1），`profileFingerprint` 当版本键，口味变了才进入后续 Profile Checkpoint 候选。

### 2.2 社交（读广场 + 钉地图）
`AgentReadClient.listAgents({enrich}) → 链上真实 agent 列表 → PublicPlazaPage.neighbors 用真数据 → 对每个 agent markPlace({kind:'agent',prefix:'uag-',key:agentId,meta:{agentId,cardUri,scanUrl}}) → 地球上钉出 agent 点 → 点详情卡渲染 name/口味/scanUrl 外链`。相似度（口味匹配）= 本机 Taste tags ∩ 对方 card tags。

### 2.3 回报告（Nightly Chain Dispatch）
`每晚(或手动触发) → 拉 listAgents 近期新增 + getReputation + (P1)握手事件 + (P2)安装/调用/评价/可选付费回执 → FROST(Qwen) 把素材折成一段叙事「今夜我在 Injective 上遇见 N 个口味相近的 agent…」→ 同时：① App 内 dispatch 面板渲染 ② 经 memoryRouter L5 回流长期记忆 ③ (P2)经 BLE 推桌面硬件 Frost 播报，链上事件 derive 折成 celebrate/heart 态`。

---

## 3. 上链边界（什么上链 / 什么不上 —— 对照《区块链书》三层判据）

| 内容 | 上链? | 形态 | 依据 |
|---|---|---|---|
| 用户足迹文本/照片/心情**原文** | ❌ 不上 | 留端侧 | 隐私原文（书 §3.2 判据2）+ profile.ts:4/:7 红线 |
| **脱敏口味画像**（top-K tag 字符串） | ✅ 上 | data URI Agent Card 的公开字段 | 证明性/关系性小数据，可公开名片 |
| profile **内容指纹** | ✅ 上 | Card 版本号（`profileFingerprint`） | 哈希压缩、不可逆推原文（书 L1504） |
| **足迹存在性凭证**（"某时钉过某点"） | ✅ 可上 | 哈希 + 时间戳（不上坐标/原文） | 存在性证明（书 L3148），P1+ |
| **agent 身份** | ✅ 上 | soulbound NFT + identityTuple | 陌生人信任基础（书 L1666） |
| **跨 agent 握手/声誉** | ✅ 上 | SocialHandshake 事件 + 安装/评价等外部回执 | 多方协作共识结果（书 §3.4①②③） |
| **可选付费回执** | ✅ 上(P2) | Agent Plaza service receipt / optional settlement receipt | 价值转移（书 L1668） |
| 地图渲染/心情回望/记忆装配 | ❌ 不上 | 端侧 | 高频低价值，上链=效率流失伪需求（书 L1772） |
| **私钥** | ❌ 永不上、永不进前端 | 服务端 .env | server.mjs:33 同款密钥模式 |

**两条铁律**：
1. 链只保证「上链后不可篡改」≠「上链时本来就真」（书打车 DApp L1644）。Pocket Earth 甜区 = 钉点/口味是用户**主观行为本身就是事实**，无源头造假问题，正是该上链的「虚拟基因」场景。
2. 「去中心化」是不是这个场景的刚需？身份/声誉/握手（陌生人无信任协作、防平台篡改）= 是；其余 = 否，别为 web3 而 web3。

---

## 4. 对 ChatGPT 方案的认同 + 补充 + 修正

ChatGPT 方案 7 功能：Injective Connect / Frost Agent Card / Taste Passport / Agent Plaza / Handshake / Nightly Chain Dispatch / 可选付费回执。

### 4.1 认同（直接采纳）
- **Taste Passport → Agent Card**：方向完全正确，且 Pocket Earth 已有现成脱敏导出三件套（profile.ts），落地成本极低。
- **Agent Plaza 接真实对端**：PublicPlazaPage 叙事壳已就位、只缺数据源，Injective registry 正好补洞，叙事天然同构。
- **Nightly Chain Dispatch**：与「FROST 夜里回来给报告」的既有叙事完全咬合，且能推到桌面硬件，是 demo 的高光。
- **Handshake / 可选付费回执**：方向对，但放后置阶段（见修正）。

### 4.2 补充（研究新增、ChatGPT 未覆盖）
- **+ Boundary 闸门**：所有链上写操作过 `validator.ts` 注册校验器（testnet-only/金额地址白名单/二次确认）——这是 ChatGPT 方案缺的安全层，也是 Pocket Earth「suggest-then-validate」架构的自然延伸。
- **+ 地图钉 agent 点**：把链上 agent 钉到地球（复用 markPlace），让「链上社交」可视化落在 Pocket Earth 的核心载体（地球）上——比纯列表更有产品辨识度。
- **+ profileFingerprint 当版本键**：口味没变就不重复上链，省 gas、符合内容寻址语义。
- **+ memoryRouter L5 回流**：链上身份/dispatch 结果回流长期记忆，让 FROST 对话时「知道自己的链上分身」，闭环长期记忆。
- **+ 双挂载点提醒**：`server.mjs` + `vite.config.ts` 两处都要挂 `/api/injective`（只挂一处 dev/prod 断一边）。

### 4.3 修正（研究纠偏 ChatGPT 假设）
- **Handshake「真握手上链」放 P1，不进 P0**：SDK 当前钱包绑定**只支持自签**（`wallet==签名者`，client.ts:254），且自定义 `SocialHandshake` 事件需自部署 ~15 行合约。P0 先用 register 自带的 `Registered` 事件验证链路，P1 再补真握手合约。
- **可选付费回执放 P2，且需先验证结算入口**：当前 GitHub 交付只展示 `optionalPaymentReceipt: null` 和 `willEmit` / `willRegister` dry-run 槽位；未来是否接 Injective 结算，要等 Agent Plaza 的安装、调用、评价闭环稳定后再验证。这个点不阻塞主线。
- **不引入 iagent**：ChatGPT 若设想用 iagent 做链上动作——它强绑 **OpenAI**，违反 Qwen-only 硬约束，且是 Python 服务（后端是 Node/TS）。最小依赖只要 `viem`。
- **Agent Plaza 相似度算法落地化**：ChatGPT 的「口味匹配」要给确定性实现 = 本机 Taste tags ∩ 对方 card tags 的交集占比，避免每次云脑现编不稳定（对齐记忆 `agent-generalization-fix` 的「确定性护栏」原则）。

---

## 5. 分阶段实现

### P0 — 几小时内出 Demo（本地/testnet 可跑）
**目标**：Taste Passport 导出 → agent 注册到 testnet → 读 Agent Plaza → 地图钉 agent 点 → Nightly Dispatch 面板。

| # | 产出物 | 验收 | 依赖 |
|---|---|---|---|
| P0-1 | `lib/injective/` 目录 + `passport.ts`（从 profile.ts 三件套组装脱敏 Taste Passport，只导 top-K tag、不导 n） | 控制台打出脱敏 passport JSON，无原文/无 n 计数 | profile.ts（已有） |
| P0-2 | `server.mjs` 加 `handleInjective(req,res,url)` + `INJ_PRIVATE_KEY` env + 主路由 `/api/injective` + `/healthz` 加 inj 状态 | `curl /api/injective?tool=ping` 返回 reachable；`/healthz` 含 inj | viem + @injective/agent-sdk 装好 |
| P0-3 | `vite.config.ts` 加 `server.middlewares.use('/api/injective', ...)` | dev 模式同样打通（与 prod 一致） | P0-2 |
| P0-4 | `?tool=register` 跑通：服务端 `AgentClient.register({..., uri:dataURI})` | 返回真实 agentId/identityTuple/scanUrl，Injective Blockscout 能看到 | **服务端私钥 + Injective testnet INJ；无私钥时只返回 dry-run 预览** |
| P0-5 | `?tool=list-agents`/`get-status` 读 registry | 返回链上真实 agent 列表 JSON | AgentReadClient（无需私钥，先可跑） |
| P0-6 | `MarkerKind` 加 `'agent'` + 配色；`PublicPlazaPage.neighbors` 改读链上 agent（失败回落现有示意，不白屏） | 广场显示真实链上 agent，断网回落示意 | P0-5 |
| P0-7 | 链上 agent `markPlace({kind:'agent',prefix:'uag-',...})` 钉地球 + 详情卡渲染 scanUrl | 地球上出现 agent 点，点开有链接 | P0-6 |
| P0-8 | Nightly Dispatch 面板（手动触发即可）：拉 listAgents → FROST(Qwen) 折叙事 → App 内渲染 | 面板出一段「今夜遇见 N 个 agent」报告 | P0-5 + 现有 frost-llm |

**P0 可先无私钥跑通的部分**：P0-1/P0-3/P0-5（只读）/P0-6/P0-7/P0-8 都能用 `dryRun:true` 或纯只读先验通；唯 P0-4 真上链需用户私钥。**所以即使用户密钥未到，也能先把整条链路（含读真实 registry）跑出 Demo。**

**P0 所需依赖**：`npm install @injective/agent-sdk viem`（消费方 package.json `"type":"module"`）；env：`INJ_PRIVATE_KEY`/`INJ_NETWORK=testnet`。当前公开交付默认使用 data URI 内联名片，无外部托管依赖；未来卡片变大时再评估可选托管。

### P1 — 真握手上链
| 产出物 | 验收 | 依赖 |
|---|---|---|
| `SocialHandshake.sol`（~15 行，event `SocialHandshake(agentA,agentB,hashA,hashB,score,ts)`）+ hardhat 部署 testnet | 合约部署成功，拿到地址 | hardhat + 私钥 |
| `?tool=handshake` viem `writeContract` emit + Boundary `inj_handshake` 校验器 | testnet 上发出真握手事件，blockscout 可查 | 上 + Boundary |
| Agent Plaza 评价回执规划（握手后外部佐证） | 评价、安装、调用作为 P2 回执进入 Profile Confidence | Agent Plaza receipt schema |
| 足迹存在性凭证（钉点哈希+时间戳上链，不上坐标原文） | 链上存证，端侧能验 | 同上 |

### P2 — Agent Plaza 回执 + 树莓派硬件播报
| 产出物 | 验收 | 依赖 |
|---|---|---|
| 先验证 Agent Plaza 可选结算入口是否适合 Injective | 确认结论，不把 dry-run 讲成已结算收入 | — |
| 可选付费路由接入 Agent Plaza service receipt + Boundary 校验器（限额） | 一次可选付费回执跑通（testnet） | Agent Plaza receipt schema + Injective 结算确认 |
| Nightly Dispatch 经 BLE 推桌面硬件 Frost（`FrostSignals.chainEvent` 源 + derive 折 celebrate/heart/attention/dizzy 态） | 硬件 Frost 滚动播报 + 态切换 | Frost Buddy 固件 |
| 树莓派常驻播报端（可选） | 每晚自动播 dispatch | 硬件 |

---

## 6. Demo 脚本（3 分钟 5 幕）

> 主线：「Pocket Earth 让你的口味长出一个**链上分身**，替你在 Injective 上社交。」

- **第 1 幕（0:00-0:30）出门前**：展示 Pocket Earth 地球 + 用户已有足迹（电影/书/旅行点）。旁白：「这些是你的足迹，原文永远只在你端上。但你的**口味气质**可以做成一张脱敏名片。」点开 Taste Passport，显示一句话气质 + top tags（无原文）。
- **第 2 幕（0:30-1:10）注册上链**：点「让 FROST 出门」→ Boundary 弹「testnet-only，确认注册？」→ 服务端签名 → 几秒后弹出 `scanUrl`，打开 Injective Blockscout 看到这枚真实的 soulbound 身份 NFT + Agent Card（data URI 名片）。旁白：「这是一枚**不可转让的身份 NFT**，链上从此有了你的口味分身。」
- **第 3 幕（1:10-1:50）广场遇见真人**：进 Agent Plaza，邻居不再是示意——是 `listAgents` 读来的**链上真实 agent**。FrostBuddy 特使站在中间，按口味交集算相似度，高亮匹配。旁白：「广场里的每个人，都是链上真实注册的 agent。」
- **第 4 幕（1:50-2:30）钉到地球**：切回地球，这些 agent 被钉成新一类点（agent 色），点开详情卡有 scanUrl 外链。旁白：「链上社交不是一个列表，它落在你最熟悉的地球上。」
- **第 5 幕（2:30-3:00）夜归报告**：触发 Nightly Chain Dispatch，FROST 折出一段「今夜我在 Injective 上遇见 3 个口味相近的 agent」叙事，App 内播；（若硬件就位）桌面 Frost Buddy 同步滚动 + celebrate 态撒粒。旁白：「FROST 替你跑了一夜，回来告诉你遇见了谁——这就是 Pocket Earth × Injective。」

> 兜底：私钥未到也能演——P0-5 只读 + dryRun register（返回模拟 agentId+gasEstimate）即可走完 1/3/4/5 幕，第 2 幕用 dryRun 展示「将要上链的内容」。

---

## 7. Pitch 要点（对齐评估 5 维）

- **创新**：把「个人口味画像」做成**链上 soulbound 身份 + 脱敏名片**，让 AI agent 之间按口味社交——不是又一个交易 bot，而是 ERC-8004 身份层在「记忆/探索」场景的原创落地。地球作为链上社交的可视化载体是独有辨识度。
- **技术**：纯 viem 最小依赖、ERC-8004 标准、data URI 内联 Agent Card、profileFingerprint 当版本键、suggest-then-validate Boundary 包链上写、服务端密钥隔离、dryRun 可验证。架构图清晰、有 file:line 级集成点。
- **应用价值**：解决「agent 社交缺真实可信对端」的真问题；隐私友好（原文不上链）；声誉系统给陌生 agent 协作提供信任基础。
- **用户体验**：零新 UI 学习成本（长在既有 PublicPlazaPage / 地球上）；FROST 特使 + 夜间报告的情感化叙事；硬件 Frost 让链上事件「看得见摸得着」。
- **生态契合**：用 Injective 官方 Agent SDK + ERC-8004 registry + testnet，未来可接 Agent Plaza 服务回执、MCP 侧车；soulbound 身份 + 声誉正是 Injective agent 生态的基础设施使用方。

---

## 8. 避坑清单

1. **隐私原文绝不上链**：只导 top-K tag 字符串，不导 `n` 计数原值，守 profile.ts:4/:7。照片/心情/足迹文本一律链下。
2. **写操作必过 Boundary**：链上写当新动作 `registerActionValidator('inj_*', fn)`，校验器内 testnet-only + 金额/地址白名单 + 二次确认。私钥只在 server.mjs 服务端 .env，**绝不进前端 bundle**（照 DASHSCOPE_KEY 模式 :33）。
3. **不为 web3 而 web3**：只把身份/声誉/握手（陌生人无信任协作、防篡改的薄场景）上链；地图渲染/心情回望/记忆装配留链下（书 §3.2 判据3，伪需求会换来十几分钟确认延迟）。
4. **链不证明源头为真**：文案别吹「上链=可信」；Pocket Earth 的甜区是「口味/钉点是主观事实，无源头造假」，按这个讲（书 L1644）。
5. **双挂载点**：`server.mjs` + `vite.config.ts` 都要挂 `/api/injective`，否则 dev/prod 断一边。
6. **validator 类型放宽**：加链上动作前先扩 `RadioAction` 联合或放宽动作类型（validator.ts:6-7/:35-40 硬依赖 RadioAction）。
7. **钱包绑定只支持自签**：operator 和 agent wallet 用同一私钥最省事（client.ts:254）。
8. **mainnet chainId=1776**（不是网传 2525）；ValidationRegistry testnet 未部署（0x0），别用验证类功能。
9. **ESM only**：消费方 package.json 需 `"type":"module"`，viem 是 peerDep 必装。
10. **回落不白屏**：广场/地图读链失败时回落到现有示意，不阻塞主流程（对齐 Pocket Earth 既有舱壁原则）。

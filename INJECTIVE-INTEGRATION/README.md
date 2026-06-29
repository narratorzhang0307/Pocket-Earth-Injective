# Pocket Earth × Injective 核心集成

> **一句话**：Pocket Earth 把个人的书、影、乐、照片、行程和心情组织成一颗本地地球；Injective 为 Frost agent 提供公开可复验的身份、钱包时间线、握手事件和未来 Profile Chain 回执。私人记忆原文不上链，链上只保存身份、版本、回执和公开证明。

这份集成不是把链贴在产品旁边，而是把 Injective 放进 Pocket Earth 的 agent 方法里：Frost 在本地理解用户，在 Injective 上拥有 ERC-8004 身份，在 public-plaza 读取其他公开 agent，在 SocialHandshake 中留下只含承诺哈希的社交证明，并为后续 Agent Plaza、Profile Checkpoint 与 Frost Buddy 硬件节点预留同一条证据链。

---

## 叙事骨架

| 演示稿主线 | 产品含义 | Injective 证据 |
|---|---|---|
| 把地球作为方法 | 书、影、乐、照片、行程和心情都先落到真实坐标，地球成为统一索引 | 链上不保存原始坐标和私人内容，只证明公开 agent 身份与时间顺序 |
| Frost 起源 | Frost 不是聊天框，而是会委派子 agent、沉淀画像、替用户出门的数字分身 | `agentId 43` 是 Frost 主身份，`agentId 44-47` 是同一 builderCode 下的公开身份簇 |
| 一条线走完 | 票根/截图/书影乐 -> 端侧脱敏 -> 钉回地球 -> Frost 带公开名片去社交 | `get-chain-evidence` 串起身份、mint、钱包时间线、握手和 plaza 复验入口 |
| 三个入口一颗地球 | PHOTOS 看回忆，MY MAP 看全局，AGENTS 负责运行，产出最终都回到地球 | `public-plaza` 读取链上 agent 并钉回地球；`agent-plaza` 保留安装闭环 |
| 端云双脑和长期画像 | 端侧负责挑/找/脱敏，云端负责表达；画像越用越懂你 | Profile Chain 只规划 checkpoint 和回执，不把原始画像、照片、心情或精确坐标上链 |
| Frost Buddy | music-agent 和链上见闻可以被实体 Frost 播报 | `hardware/frost-buddy/` 只消费公开 JSONL 事件，不接触私钥或画像原文 |

---

<a id="final-ppt-index"></a>

## 最终整合版内容映射与逐页覆盖索引

最终整合版的 41 页不是平铺材料，而是一条从产品方法到链上证明的路径。集成文档按同一结构收束，方便快速核对“PPT 讲到的东西，仓库里是否有证据”。下面的表不是摘要，而是逐页主张对应到工程入口和可复验字段。

| PPT 页 | 核心主张 | Markdown / 代码落点 | 可复验点 |
|---|---|---|---|
| 1 | Pocket Earth 是空间知识库 + AI 社交，Injective 提供 ERC-8004 链上身份 | 根 README 的 Injective 核心集成、`chain-proof-data.mjs` | `agentId 43-47`、`builderCode=pocket-earth`、`chainId 1439` |
| 2 | 独立开发闭环与跨界背景 | 公开仓库只保留“产品可运行、证据可复验”的工程定位；个人背景不作为链上证明字段 | `sourceControl` 只锚当前 GitHub 版本 |
| 3-5 | 把地球作为方法、Frost 起源、一条线走完 | 根 README 第 1-3 节；`markPlace`、端侧脱敏、书影乐照片行程心情六类对象 | `npm run verify:positioning` |
| 6-8 | 三入口一颗地球、PHOTOS 三视图 | `userMarks` / `planets` / `geoStickers` store，Mapbox `source.setData()`，照片缩略图/高清分层 | `npm run verify:demo` |
| 9-13 | 六大落点 agent、JOT、music/travel、COUNCIL、端侧整理 | `open-dj-director`、`radio-24h-director`、travel archive、`src/app/council/`、CLIP / Qwen-VL / REDACT / dHash | `docs/技术难点与解决方案.md` |
| 14-18 | frost-agent harness、端云双脑、长期画像、skills、trace | Shell / Brain / Selector / Router / Memory / Boundary / Sub-agents；`intentRegistry`、`edgeSafe`、`RunTrace`、`FrostBus`、SSE | `ARCHITECTURE.md`、`npm run verify:positioning` |
| 19-24 | AI 社交、Agent Personality Provenance、Profile Chain 信任模型 | `recordHash -> domainRoot -> ProfileRoot -> profileHash`、`ProfileCheckpoint`、Profile Confidence L0-L4 | `npm run verify:public-proof` |
| 25-26 | ERC-8004 身份与隐私边界 | `agentId 43` 主身份、`agentId 44-47` 子身份、data URI Agent Card、SocialHandshake 事件、`privacyBoundary` | `npm run verify:agent-proof`、`npm run verify:wallet` |
| 27-29 | Profile Chain 机制与反作弊 | hash 只作变化传感器；公开 Taste Passport 发生有意义变化才产生 checkpoint 候选；快速变脸/随机标签会降低置信度 | `npm run verify:integration-guide` |
| 30-31 | Agent Plaza：社交广场 + 安装市场 | `public-plaza`、`agent-plaza`、`agentGeo`、FNV-1a、`reviewManifest`、`toManifest`、`willEmit` dry-run | `npm run verify:plaza-flow`、`npm run verify:plaza` |
| 32-35 | 商业逻辑、硬件节点、市场判断、差异化 | 平台模式仅引用官方来源；Frost Buddy 是 Raspberry Pi / BLE / TTS 轻量节点，不写成重资本硬件路线 | `PITCH-NOTES.md`、`npm run verify:pitch`、`npm run verify:hardware` |
| 36-41 | 用户痛点、创新影响、路线图、结论 | P0/P1/P2 与 Profile Chain NOW/P1/P2/P3/P4 对齐；当前闭环是身份、钱包时间线、握手和公开 API | `reviewEntrypoints`、`deliveryChecklist`、`npm run verify:delivery` |

按旧七段口径核对时，41 页也可归并为：产品方法、体验表面、frost-agent 内核、AI 社交与 Profile Chain、链上身份与隐私边界、Agent Plaza 与物理节点、商业判断、差异化、路线图。逐页表负责细节，七段口径负责读者快速扫主线。

这张映射表只列公开证据和工程入口；外部材料中的个人背书、市场判断和硬件远景，进入仓库时都按“可验证、不过度承诺、不泄露隐私”的边界重写。

---

## 1. 架构主线

| 层 | Pocket Earth 中的角色 | Injective 中的角色 |
|---|---|---|
| 空间知识库 | 把书、电影、音乐、照片、行程和心情落到真实坐标，形成个人地球 | 不保存原始内容，只接收可公开的身份和证明 |
| frost-agent harness | Shell / Brain / Router / Memory / Boundary / Sub-agents 共同编排；端侧 Selector 负责挑选，云端 Brain 负责表达 | 为每个 agent 的公开身份、握手和未来回执提供可核验索引 |
| Frost Passport | 从长期画像中导出脱敏 Taste Passport，只含 top-K 标签、公开端点和说明 | ERC-8004 `agentId` + data URI Agent Card |
| Profile Chain | 用 `recordHash -> domainRoot -> profileRoot -> profileHash` 描述画像演化 | 未来写入 `profileHash + version + timestamp + signature` checkpoint |
| public-plaza | 读取链上 agent，计算公开标签重叠，并把相似 agent 钉回地球 | 按 `builderCode=pocket-earth` 读回 `agentId 43-47` |
| agent-plaza | agent 市集、manifest 审核、安装、My Agents 回流 | 未来接入安装、调用、评价和可选付费回执 |
| Frost Buddy | Raspberry Pi / BLE / TTS 事件桥，让 music-agent 与链上见闻被实体 Frost 播报 | 只消费公开事件，不接触私钥、画像原文或精确坐标 |

---

## 2. 已实现能力

| 能力 | 文件 | 状态 |
|---|---|---|
| Taste Passport 脱敏名片，只导标签字符串，不含原文和热度 | `src/app/lib/injective/passport.ts` | 已实现 |
| `/api/injective` 服务：`ping` / `list-agents` / `get-status` / `get-reputation` / `get-chain-evidence` / `get-agent-proof` / `get-wallet-timeline` / `get-hardware-bridge-proof` / `register` / `handshake` | `injective-service.mjs` | 已实现 |
| dev/prod 双挂路由 | `server.mjs` / `vite.config.ts` | 已实现 |
| Injective testnet 连通性 | `npm run verify:injective` | 已复验 |
| `public-plaza` 读取链上真实 agent，失败时回落本地示意，不白屏 | `PublicPlazaPage.tsx` | 已实现 |
| 链上 agent 钉回地球，新增 `agent` 标记类型 | `mapMarkers.ts` | 已实现 |
| Nightly Chain Dispatch，把链上见闻写成人话 | `PublicPlazaPage.tsx` | 已实现 |
| Frost Buddy 硬件事件桥，支持 music-agent + Injective 链上见闻 -> JSONL -> Raspberry Pi / BLE / TTS | `hardware/frost-buddy/` | 已实现 |
| SocialHandshake 合约，只存 agentId、名片哈希、相似度和时间戳 | `INJECTIVE-INTEGRATION/contracts/` | 已部署 |
| register / handshake 真写逻辑，testnet-only，必须 `confirm:true` | `injective-service.mjs` | 已上链验证 |
| 公开证据契约，固定 `recordingOrder[].evidenceFocus`、隐私边界和复验入口 | `chain-proof-data.mjs` + verification scripts | 已实现 |

---

## 3. 链上事实

| 证据 | 当前值 | 复验方式 |
|---|---|---|
| Network | Injective testnet, `chainId 1439` | `npm run verify:injective` |
| IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | `npm run verify:registry` |
| Owner / wallet | `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934` | `npm run verify:wallet` |
| Frost 主身份 | `agentId 43`, `builderCode = pocket-earth` | `/api/injective?tool=get-agent-proof&agentId=43` |
| Agent 身份簇 | `agentId 43-47`，同一 builderCode | `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47` |
| SocialHandshake | `0xe5338a162a44a685201e1f6120b1a851949e3aee` | `npm run verify:handshake` / `npm run verify:injective` |
| 真实握手 | `agentId 43 <-> 44`, score `88` | `npm run verify:wallet` |

SocialHandshake 的部署交易 `0x6048425a...fa722` 由同一测试网钱包创建；`verify-handshake-contract.mjs` 会核验部署交易、合约地址推导、transaction input 与本地 creation bytecode，并重新编译 `SocialHandshake.sol` 比对 Injective testnet runtime bytecode。

---

## 4. 数据流

```text
长期画像 profile.ts
  -> buildTastePassport() 只导 top-K 标签字符串
  -> Taste Passport 脱敏名片
  -> POST /api/injective?tool=register
  -> Injective ERC-8004 IdentityRegistry
  -> GET /api/injective?tool=list-agents&builderCode=pocket-earth
  -> public-plaza 计算公开标签重叠
  -> 地球上的 agent 标记点
  -> Nightly Chain Dispatch
  -> hardware/frost-buddy JSONL 公开事件
  -> Raspberry Pi / BLE / TTS 适配器
```

写链路径始终走 `suggest -> confirm -> sign`。没有 server 端私钥、没有 `confirm:true`、或不是 testnet 时，`register` / `handshake` 只返回 dry-run 预览，不会产生交易。

---

## 5. API 分层

| 方法 | 端点 | 返回 | 私钥 |
|---|---|---|---|
| GET | `/api/injective?tool=ping` | `{ reachable, sdk, network }` | 否 |
| GET | `?tool=list-agents&builderCode=pocket-earth&limit=20` | `{ sdk, agents, total, offset, limit }`，可读回 Pocket Earth agent fleet；每个 agent 带 `owner/wallet/identityTuple/builderCode`，#44-47 的 data URI 名片带 `card.tags` 与 `card.metadata.builderCode` | 否 |
| GET | `?tool=get-status&agentId=N` | StatusResult | 否 |
| GET | `?tool=get-reputation&agentId=N` | `{ score, count, clients }` | 否 |
| GET | `?tool=get-agent-proof&agentId=43` | 单 agent 证明卡：owner、`builderCode`、registry、mint tx、身份页、钱包页、源码锚点 | 否 |
| GET | `?tool=get-chain-evidence` | 公开证据包：`registryMintEvents`、`registryMintSummary`、`timeline`、`timelineSummary`、`handshakeProof`、`hardwareBridge`、`reviewBrief`、`judgeRunbook`、`reviewLinks`、`reviewChecklist`、`integrationAlignment`、`reviewEntrypoints`、`deliveryChecklist`、`publicReadApis`、`recordingOrder`、`privacyBoundary`、`plazaFlow`、`sourceControl` | 否 |
| GET | `?tool=get-wallet-timeline` | `{ chainId: 1439, readOnly: true, publicOnly: true, summary, events }`，从 RPC 复验钱包时间线 | 否 |
| GET | `?tool=get-hardware-bridge-proof` | Frost Edge Node 单页证明卡：`hardwareBridge`、`chainDispatch.chainRead`、Pi 技能白名单、公开 JSONL 隐私边界和源码锚点 | 否 |
| POST | `?tool=register` `{ passport, confirm }` | `{ agentId, txHashes, scanUrl }`；未确认时 dry-run | 真写需 |
| POST | `?tool=handshake` `{ agentA, agentB, profileHashA, profileHashB, score, confirm }` | `{ txHash }`；未确认时 dry-run | 真写需 |

五条公开只读入口由 `publicReadApis` 固定：`get-chain-evidence`、`get-agent-proof&agentId=43`、`list-agents&builderCode=pocket-earth`、`get-wallet-timeline`、`get-hardware-bridge-proof`。每条都带 `judgeFocus` 和 `expectedFields`，方便快速复验字段，不需要展开源码。`agent-fleet-api` 的 `expectedFields` 固定 `agents[].owner`、`agents[].wallet`、`agents[].identityTuple`、`agents[].builderCode`、`agents[44-47].card.tags`、`agents[44-47].card.metadata.builderCode`、`total`、`offset`、`limit` 和 `sdk`，让公开名片、分页范围和 builderCode 过滤都能被逐项核对。

---

## 6. 复验路径

```bash
npm install
npm run dev
curl 'localhost:5173/api/injective?tool=ping'

npm run verify:demo
npm run verify:duration
npm run verify:evidence
npm run verify:public-proof
npm run verify:public-apis
npm run verify:integration-guide
npm run verify:github
npm run verify:positioning
npm run verify:pitch
npm run verify:judge
npm run verify:brief
npm run verify:review
npm run verify:review-links
npm run verify:recording-order
npm run verify:wallet
npm run verify:source
npm run verify:registry
npm run verify:agent-proof
npm run verify:plaza-flow
npm run verify:nova-alignment
npm run verify:delivery
npm run verify:injective
npm run verify:plaza
npm run verify:hardware
```

其中 `npm run verify:demo` 是录制前总检查：`verify:demo` 会串起公开证据包、钱包时间线 API/RPC 事实表、文档定位快检、`sourceControl`、`reviewBrief`、`judgeRunbook`、`builderCode=pocket-earth` fleet 读回、Registry mint 事件、Blockscout 链接、`recordingOrder`、`plazaFlow`、`integrationAlignment`、`reviewEntrypoints` 和 `deliveryChecklist`。

`npm run verify:delivery` 固定 GitHub 仓库、线上 `?demo`、五条公开 API、`JUDGE-QUICKSTART.md` 和交付清单；`npm run verify:github` 确认远端 README、集成说明、证据包、录制脚本和 60 秒复验入口都仍指向 `Pocket-Earth-Injective`。

---

## 7. 隐私边界

对照链上证明的基本边界：链只证明“某个公开事实在某个时间被写入”，不证明人生原文，也不应该承载私人记忆。

| 类型 | 内容 |
|---|---|
| 上链 / 公开 | ERC-8004 agent 身份、公开 Agent Card 字段、钱包地址、SocialHandshake agentId、名片哈希承诺、相似度分、区块时间戳 |
| 留在端侧 / 服务端 | 书、影、乐、照片、心情原文、精确坐标、长期画像计数、私钥和 secret env |
| 公开 API 守门 | `readOnly: true`、`publicOnly: true`、旧仓库误指检查、本地路径和密钥名泄露检查 |

Frost Buddy 的硬件桥也遵守同一条线：`hardware/frost-buddy/` 只发公开 JSONL 事件，Pi 侧 `frost_pi_skill_agent.py` 只把语音请求路由到音乐命令或 `chain_dispatch` 公开事件，不接触私钥、画像原文或 `bytes32` 名片哈希。

---

## 8. 相关文档

- 公开链上证据：`CHAIN-EVIDENCE.md`
- 60 秒复验入口：`JUDGE-QUICKSTART.md`
- 录制脚本：`DEMO-SCRIPT.md`
- 技术进度与断点：`PROGRESS.md`
- SDK / ERC-8004 研究：`RESEARCH.md`

## 9. 技术深挖：Profile Chain 与 Proof of Memory

PPT 第 19-29 页的核心不是“再做一个身份系统”，而是补上 AI 分身最缺的 Agent Personality Provenance：公开画像到底来自长期真实使用，还是临时 prompt 编出来的人设。Pocket Earth 的回答是把本地空间知识库变成 Proof of Memory 的来源层，把 Injective 变成公开回执层。

| 概念 | 技术含义 | 上链边界 |
|---|---|---|
| `recordHash` | 每条书、影、乐、照片、行程、心情记录的稳定 fingerprint；用于感知“这条记录是否变了” | 不上链原文，不泄露书单、照片、心情和精确坐标 |
| `domainRoot` | 按 books / movies / music / photos / travel / mood 聚合的域级 root | 只作为证明结构的一层，不等于公开完整画像 |
| `ProfileRoot` | 多个 domain root 聚合后的本地画像输入指纹 | 是变化传感器，不是内容容器 |
| `profileHash` | 公开 Taste Passport 的版本指纹，来自 top-K 标签、公开端点和名片说明 | 只有公开名片发生有意义变化，才进入 checkpoint 候选 |
| `ProfileCheckpoint` | `agentId, version, previousProfileHash, newProfileHash, evidenceRoot, timestamp` 组成的回执形态 | 未来写入 Injective，只证明版本顺序、签名和时间 |

Profile Confidence 分 L0-L4：L0 是自声明标签；L1 是本地知识库生成；L2 是时间连续性；L3 是选择性证明/Merkle 片段；L4 是 SocialHandshake、安装、评价等外部回执。Profile Confidence 不是 Credit Score，不判断“人好坏”，只判断公开画像有多少长期数据支撑。反作弊也按这套置信逻辑处理：批量灌入、随机标签、短期快速变脸不能被完全阻止，但会缺少时间跨度、来源权重、稳定性和社交佐证。

## 10. 技术深挖：frost-agent harness 与可观测编排

PPT 第 14-18 页对应的工程底座已经落在 `frost-agent/` 和 `src/app/lib/observe/`：

- **CEO 委派**：主 Frost 不吞全部噪声，只把对象委派给 music / books / movies / photos / travel / mood / council 等子 agent；子 agent 在独立上下文里产出结构化结论。
- **端云双脑**：Selector 负责挑、找、分、排；Brain 负责写、讲、总结。`edgeSafe` 把 MNN / ollama / stub 三级回落包成同一个契约，云端 `complete()` 不可用时走规则兜底。
- **注册表化边界**：`intentRegistry` 管意图到 handler 的映射，`registerActionValidator` 管动作落地校验；未注册动作默认拒绝，避免 agent 自己越权写入。
- **可观测事件树**：`FrostBus` 用 `runId` / `parentId` 串起 router -> agent -> skill 的调用树，1000 容量 ring buffer 让晚订阅的 `RunTrace` 也能补到开头事件；handler 抛错不影响业务。
- **真流式通道**：`/api/frost-llm-stream` 透传 SSE，响应头带 `x-accel-buffering:no`；per-token 只走 `onToken`，不进 FrostBus，避免 token 粒度事件灌爆 ring buffer。
- **skill 沉淀**：运行时 skill 按识图结构化、落点钉地球、云脑/本地库、记忆/反思分层；开发期 skill 只作为工程约束，不进入用户数据链。

这套 harness 让 PPT 里的“FROST 是 CEO，每一跳都看得见”不是叙事口号，而是运行页上的 RunTrace、全局 RunDrawer、health 记录和验证脚本共同构成的工程事实。

## 11. 技术深挖：Agent Plaza 与物理节点入口

PPT 第 30-33 页把广场拆成两条路：公开社交广场和可安装的 Agent 市场。仓库里也按两条线实现，避免把链上社交、商业安装和硬件播报混成一个概念。

| 模块 | 现在做什么 | Injective 连接 |
|---|---|---|
| `public-plaza` | 读取 `builderCode=pocket-earth` 的链上 agent，按公开标签交集计算相似度，把 agent 钉回地球 | `list-agents`、SocialHandshake、`agentGeo` + FNV-1a 稳定经纬度 |
| `agent-plaza` | 展示可安装 agent、manifest/schema/permissions、安装到 My Agents | `reviewManifest` 默认拒绝未知字段，`toManifest` 只白名单转译，DANGER 扫描剥掉 URL / 支付 / 可执行代码 |
| 写链预览 | 没有私钥、合约或 `confirm:true` 时只返回 dry-run | `willEmit` 说明未来会发什么事件，不偷偷上链 |
| Frost Edge Node | `hardware/frost-buddy/` 用 JSONL 事件桥连接 Raspberry Pi / BLE / TTS | 只消费公开 chain_dispatch 和 music-agent 事件，不接触私钥、画像原文、`bytes32` 哈希原文 |

硬件表达要克制：Frost Buddy 是 music-agent 的实体化和链上见闻播报的原型接口，说明 Pocket Earth 可以走出屏幕；Frost Buddy 不是当前收入支柱，也不承诺量产硬件闭环。

## 12. 技术深挖：Frost Edge Node 硬件原理与市场边界

PPT 第 33 页的硬件结论是“实体节点，不是重资本硬件路线”。这句话在工程上对应一个很小、很明确的模块：`hardware/frost-buddy/` 只定义 Pocket Earth 到 Raspberry Pi 的公开事件合同，不把钱包、私钥、画像原文或照片数据放进设备。

```text
Pocket Earth App / public-plaza
  -> music_now_playing 或 chain_dispatch 公开事件
  -> hardware/frost-buddy/frost-hardware-bridge.mjs
  -> newline-delimited JSON envelope
  -> Raspberry Pi skill router / adapter
  -> BLE、serial、MQTT、本地 TTS、小屏幕或按钮反馈
```

### 硬件为什么存在

| PPT 主张 | 工程落点 | 用户价值 |
|---|---|---|
| music-agent 实体化 | `music_now_playing` 事件带 `title/body/speak/track/city`，Pi 可以把当前播放说出来 | Frost Radio 不只在网页里闪，桌面上也有一个会播歌、会回应的实体 Frost |
| 链上见闻实体化 | `chain_dispatch` 事件带 `agentIds`、`scanUrl`、公开播报文案和 `builderCode=pocket-earth` 证据 | public-plaza 读到的 Injective 链上 agent，可以被小盒子在夜里用人话播报 |
| 物理世界入口 | Pi 侧 `frost_pi_skill_agent.py` 用白名单 skill 路由“下一首 / 暂停 / 播报链上见闻” | 语音入口先被约束成命令或公开事件，再交给传输层和音频层 |
| 开发套件路线 | 传输层保持可插拔：BLE / serial / MQTT / local TTS / 小屏幕都只是 adapter | 先验证 agent 走出屏幕的体验，不把硬件写成量产承诺 |

### 事件合同

硬件事件是 JSONL，每一行都是一个公开 envelope。当前只允许这些字段：`version`、`kind`、`source`、`state`、`priority`、`title`、`body`、`speak`、`agentIds`、`scanUrl`、`track`、`city`、`createdAt`。`assertPublicEnvelope` 会拒绝不在白名单里的字段，也会拒绝私钥形态、secret env 名称和 `bytes32` 风格的私密哈希。

```json
{"kind":"chain_dispatch","source":"injective-public-plaza","agentIds":["43","44","45","46","47"],"speak":"Frost 在 Injective 链上遇见了 5 个 Pocket Earth agent。"}
```

这个合同让设备端足够简单：Pi 只需要读取一行 JSON，决定表情状态、TTS 文案、屏幕标题和外链；Pi 不需要理解 ERC-8004 合约、钱包签名、Profile Chain，也不需要知道用户完整画像。

### Pi 侧技能路由

`hardware/frost-buddy/raspi/frost_pi_skill_agent.py` 借鉴的是“白名单技能路由”模式，而不是复制任何旧仓库 daemon。Pi 侧先把松散语音归一化到有限 skill：

- `next_track` / `prev_track` / `pause` / `replay` / `volume_up` / `volume_down`：输出固定音乐命令。
- `music_now_playing`：输出 `music_now_playing` 公开事件。
- `chain_dispatch`：输出 Injective `chain_dispatch` 公开事件，默认包含 `agentId 43-47`。
- `help`：只说明设备能做什么。

如果云脑或本地识别给出不存在的 skill，路由器会回退到关键词白名单；如果输入里出现私钥、secret env 名称或像 `bytes32` 的隐私哈希，事件会直接被拒绝。`frost_pi_skill_agent_smoke.py` 离线验证这条边界，不需要网络、钱包、BLE 设备或 GitHub token。

### 市场判断

硬件被放在 P4 / Frost Network，而不是当前收入主线。市场判断分三层：

| 判断 | 依据 | 对 Pocket Earth 的含义 |
|---|---|---|
| Raspberry Pi 适合做原型平台 | Raspberry Pi 官方投资者页披露累计出货超过 6700 万台，并有全球分销和 OEM 基础；2024 IPO 文件也披露过超过 6000 万台的历史出货 | 用树莓派做 Frost Edge Node 原型是可信的工程选择 |
| 创作者平台比单点硬件更稳 | Roblox 官方年报披露 2024 年创作者 DevEx 为 9.228 亿美元；Apple Small Business Program 和 Steamworks 分成公告说明成熟平台会围绕分发、结算、抽成运转 | Pocket Earth 的商业主线应是 Agent Plaza 的安装、调用、评价和可选付费回执 |
| 消费级 AI 硬件风险高 | PPT 第 34 页把硬件列为高风险远景；仓库文档不使用无法复验的留存率或失败归因数字 | Frost Edge Node 先按开发套件和体验差异化推进，不写成硬件收入预测 |

因此硬件叙事要落在“有身体的 agent 更容易被记住”这一体验差异上：Frost Edge Node 让 music-agent、每日记忆、播客摘要和 Injective 链上见闻有一个房间里的出口；但 Pocket Earth 的可信资产仍然是长期空间记忆、公开画像回执、Agent Plaza 和 Injective 证据链。

### 隐私与安全边界

| 允许进入设备 | 永远不进入设备 |
|---|---|
| 公开 `music_now_playing` 文案、公开 `chain_dispatch` 文案、agentId、Blockscout 链接、设备表情状态 | 私钥、助记词、server env、原始画像、照片、心情、精确坐标、`profileHashA/B` 原文、`bytes32` 承诺值 |
| 白名单音乐命令，例如“下一首”“暂停”“重播” | 任意代码执行、任意 URL 抓取、任意支付动作 |
| 可选 adapter 输出：BLE、serial、MQTT、本地 TTS、小屏幕 | 钱包签名、链上写入、Agent Plaza 安装确认 |

写链仍然只在服务端 `suggest -> confirm -> sign` 路径里发生；硬件只负责读公开事件和播报，不负责签名和决策。

## 13. 外部来源与商业边界

PPT 第 32-35 页用了平台经济和硬件市场作参照。进入 Markdown 后只保留可核验来源和谨慎结论：

- ERC-8004 以官方 EIP 为准：https://eips.ethereum.org/EIPS/eip-8004 。仓库只围绕 agent 身份、registry、名片和互操作证明展开，不外推成已经成熟的全生态标准。
- Roblox 只作为“创作者平台可以形成供给侧经济”的参考，来源用官方 annual reports 页面：https://ir.roblox.com/financials/annual-reports/default.aspx ；仓库不把 Roblox 规模直接类比成 Pocket Earth 收入预测。
- Apple App Store Small Business Program 只作为平台抽成与小开发者通道参考，来源：https://developer.apple.com/app-store/small-business-program/ 。
- Steamworks 只作为数字内容平台和分发/结算报告参考，来源：https://partner.steamgames.com/doc/finance/payments_salesreporting/faq ；收入分成阶梯若要引用，使用 Steamworks 官方公告：https://steamcommunity.com/groups/steamworks/announcements/detail/1697191267930157838 。
- Raspberry Pi 只作为可信原型平台；官方投资者页披露累计出货超过 6700 万台：https://investors.raspberrypi.com/ ；2024 IPO 文件保留在 `PITCH-NOTES.md` 作为历史出货来源。仓库不把这些数字外推成 Pocket Earth 的硬件市场规模预测。

商业结论保持三句话：Pocket Earth 先做长期可用的空间知识库；长期使用沉淀出可信公开画像；可信 agent 才有资格进入 Agent Plaza，被安装、调用、评价并留下回执。

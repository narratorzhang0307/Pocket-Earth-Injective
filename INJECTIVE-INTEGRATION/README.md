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

## 最终整合版内容映射

最终整合版的 41 页不是平铺材料，而是一条从产品方法到链上证明的路径。集成文档按同一结构收束，方便快速核对“PPT 讲到的东西，仓库里是否有证据”。

| 最终整合版页段 | 核心主张 | 本仓库对应 |
|---|---|---|
| 1-7 · 产品方法 | Pocket Earth 是基于空间的知识库：用真实坐标替代时间线/数据库，把书、影、乐、照片、行程、心情收束到同一颗地球 | `README.md` 第 1-3 节，`mapMarkers.ts`，`userMarks` / `planets` store |
| 8-13 · 体验表面 | PHOTOS、MY MAP、AGENTS、JOT、music/travel、council、端侧照片整理共同证明它不是单页概念图，而是可运行产品 | `README.md` 第 4-8 节，`npm run verify:plaza` |
| 14-18 · frost-agent 内核 | CEO 委派、端云双脑、混合路由、长期画像、skill 沉淀、trace 可观测，是 agent harness 的工程底座 | `frost-agent/`、`ARCHITECTURE.md`、`docs/技术难点与解决方案.md` |
| 19-24 · AI 社交与 Profile Chain | Injective 承担 AI 分身的公共见证层：身份可查、画像版本可追溯、长期伪造成本更高 | `Profile Chain 路线`、`verify:nova-alignment`、`verify:public-proof` |
| 25-29 · 链上身份与隐私边界 | `agentId 43-47`、ERC-8004 IdentityRegistry、SocialHandshake、公开 API 与隐私不上链边界 | `链上事实`、`API 分层`、`privacyBoundary`、`verify:agent-proof`、`verify:wallet` |
| 30-33 · Agent Plaza 与物理节点 | `public-plaza` 是链上社交发现，`agent-plaza` 是安装/市场闭环；Frost Buddy 是 Raspberry Pi / BLE / TTS 的轻量实体节点 | `plazaFlow`、`hardware/frost-buddy/`、`verify:plaza-flow`、`verify:hardware` |
| 34-41 · 商业判断、差异化、路线图 | 不走泛发币社交；以空间 Agent 广场、端侧隐私、真实坐标知识库、链上身份和 Profile Chain 路线构成长期飞轮 | `PITCH-NOTES.md`、`integrationAlignment`、`reviewEntrypoints`、`deliveryChecklist` |

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
| `/api/injective` 服务：`ping` / `list-agents` / `get-status` / `get-reputation` / `get-chain-evidence` / `get-agent-proof` / `get-wallet-timeline` / `register` / `handshake` | `injective-service.mjs` | 已实现 |
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
| GET | `?tool=list-agents&builderCode=pocket-earth&limit=20` | `{ agents, total }`，可读回 Pocket Earth agent fleet | 否 |
| GET | `?tool=get-status&agentId=N` | StatusResult | 否 |
| GET | `?tool=get-reputation&agentId=N` | `{ score, count, clients }` | 否 |
| GET | `?tool=get-agent-proof&agentId=43` | 单 agent 证明卡：owner、`builderCode`、registry、mint tx、身份页、钱包页、源码锚点 | 否 |
| GET | `?tool=get-chain-evidence` | 公开证据包：`registryMintEvents`、`registryMintSummary`、`timeline`、`timelineSummary`、`handshakeProof`、`reviewBrief`、`judgeRunbook`、`reviewLinks`、`reviewChecklist`、`integrationAlignment`、`reviewEntrypoints`、`deliveryChecklist`、`publicReadApis`、`recordingOrder`、`privacyBoundary`、`plazaFlow`、`sourceControl` | 否 |
| GET | `?tool=get-wallet-timeline` | `{ chainId: 1439, readOnly: true, publicOnly: true, summary, events }`，从 RPC 复验钱包时间线 | 否 |
| POST | `?tool=register` `{ passport, confirm }` | `{ agentId, txHashes, scanUrl }`；未确认时 dry-run | 真写需 |
| POST | `?tool=handshake` `{ agentA, agentB, profileHashA, profileHashB, score, confirm }` | `{ txHash }`；未确认时 dry-run | 真写需 |

四条公开只读入口由 `publicReadApis` 固定：`get-chain-evidence`、`get-agent-proof&agentId=43`、`list-agents&builderCode=pocket-earth`、`get-wallet-timeline`。每条都带 `judgeFocus` 和 `expectedFields`，方便快速复验字段，不需要展开源码。

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

其中 `npm run verify:demo` 是录制前总检查：它会串起公开证据包、钱包时间线 API/RPC 事实表、文档定位快检、`sourceControl`、`reviewBrief`、`judgeRunbook`、`builderCode=pocket-earth` fleet 读回、Registry mint 事件、Blockscout 链接、`recordingOrder`、`plazaFlow`、`integrationAlignment`、`reviewEntrypoints` 和 `deliveryChecklist`。

`npm run verify:delivery` 固定 GitHub 仓库、线上 `?demo`、四条公开 API、`JUDGE-QUICKSTART.md` 和交付清单；`npm run verify:github` 确认远端 README、集成说明、证据包、录制脚本和 60 秒复验入口都仍指向 `Pocket-Earth-Injective`。

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

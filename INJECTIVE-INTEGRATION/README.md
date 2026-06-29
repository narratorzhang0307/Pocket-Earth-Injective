# Injective × Pocket Earth — Frost Passport on Injective

> **一句话**：Pocket Earth 让每个人的 Frost 在 Injective 上拥有一个链上身份；它白天带着你**同意公开的脱敏口味名片**去地球广场遇见相似 agent，夜里回来用人话汇报链上见闻。私人记忆原文**永不上链**。

为 Injective 新星计划做的集成。命中赛事方向「AI 社交」+「Agent × 物理世界」（硬件 Frost 播报）。不是交易 bot，而是把 ERC-8004 agent 身份层用在「记忆 / 探索 / 社交」场景。

---

## 已实现（截至 `npm run build` 编译净）

| 能力 | 文件 | 状态 |
|---|---|---|
| Taste Passport 脱敏名片（只导标签字符串、不含原文 / 热度） | `src/app/lib/injective/passport.ts` | ✅ |
| `/api/injective` 服务（ping / list-agents / get-status / get-wallet-timeline / register / handshake） | `injective-service.mjs` | ✅ |
| server + dev 双挂路由 | `server.mjs` / `vite.config.ts` | ✅ |
| **真连 Injective testnet**（ping `reachable:true`） | — | ✅ |
| Agent Plaza 读链上真实 agent（空 / 失败回落示意不白屏） | `PublicPlazaPage.tsx` | ✅ |
| 链上 agent 钉地球（新 `'agent'` 标记类型） | `mapMarkers.ts` | ✅ |
| Nightly Chain Dispatch 夜间链上见闻报告 | `PublicPlazaPage.tsx` | ✅ |
| Frost Buddy 硬件事件桥（music-agent + Injective 链上见闻 → JSONL，供 Raspberry Pi / BLE / TTS 适配） | `hardware/frost-buddy/` | ✅ 事件契约 + Pi 技能路由已就绪 |
| `SocialHandshake.sol` 握手合约（只存哈希 / 身份 / 相似度 / 时间戳） | `INJECTIVE-INTEGRATION/contracts/` | ✅ 已部署 |
| register / handshake 真写逻辑（confirm 闸门，testnet-only） | `injective-service.mjs` | ✅ 已上链验证 |
| 一键链上证明套件（agentId 43–47 + 公开 data URI 名片结构 + `/api/injective` 读链路 + 写链 dry-run 边界 + registry mint 事件 + 钱包证据链 + RPC 区块时间线 + 合约部署交易/源码字节码 + Demo/README 链接 + 握手 hash/calldata/event + 硬件桥安全事件） | `INJECTIVE-INTEGRATION/verify-chain-proof.mjs` | ✅ |

---

## 架构（数据流）

```
长期画像 profile.ts
   │  buildTastePassport()  只导 top-K 标签字符串，丢 n、丢原文
   ▼
脱敏口味名片 Taste Passport
   │  POST /api/injective?tool=register   （Boundary：无私钥/未确认 → dryRun）
   ▼
Injective testnet  ERC-8004 IdentityRegistry  →  soulbound 身份 NFT + IPFS Agent Card
   │  GET ?tool=list-agents（AgentReadClient，只读，无需私钥）
   ▼
Agent Plaza（PublicPlazaPage）  按口味交集算相似度
   │  markPlace({kind:'agent'})   确定性散布坐标
   ▼
地球  agent 标记点（蓝紫）  →  点开看 scanUrl
   │  夜间：listAgents → /api/frost-llm(Qwen) 折叙事
   ▼
Nightly Chain Dispatch  「今夜我在 Injective 上遇见 N 个口味相近的 agent」
   │  hardware/frost-buddy JSONL（公开事件，不带私钥/画像原文）
   ▼
树莓派 / BLE / TTS 适配器  →  桌面硬件 Frost 播报链上见闻
```

---

## API

| 方法 | 端点 | 返回 | 私钥 |
|---|---|---|---|
| GET | `/api/injective?tool=ping` | `{reachable, sdk, network}` | 否 |
| GET | `?tool=list-agents&builderCode=pocket-earth&limit=20` | `{agents, total}`，可直接复验 Pocket Earth agent fleet | 否 |
| GET | `?tool=get-status&agentId=N` | StatusResult | 否 |
| GET | `?tool=get-reputation&agentId=N` | `{score, count, clients}` | 否 |
| GET | `?tool=get-chain-evidence` | 公开证据包：testnet chainId 1439、agentId 43–47、ERC-8004 `registryMintEvents`、汇总 agentId 范围 / 同一 owner / mint from `0x0` 的 `registryMintSummary`、带 `from` / `expectedStatus` 的钱包 `timeline`、汇总 owner/首尾区块/RPC 复验入口的 `timelineSummary`、钱包、合约、时间线交易、Blockscout 链接、`reviewBrief`、`reviewLinks`、`reviewChecklist`、`competitionAlignment`、`submissionLinks`、`submissionChecklist`、`recordingOrder`、`privacyBoundary`、`plazaFlow` 与录屏/复验命令 | 否 |
| GET | `?tool=get-wallet-timeline` | `{summary, events}`，直接从 Injective RPC 复验钱包交易时间线，并汇总 owner、事件数、成功状态、首尾区块/时间 | 否 |
| POST | `?tool=register` `{passport, confirm}` | `{agentId, txHashes, scanUrl}`（无私钥/未 confirm → dryRun 预览；有私钥 dryRun 时可估算） | 真写需 |
| POST | `?tool=handshake` `{agentA, agentB, profileHashA, profileHashB, score, confirm}` | `{txHash}`（无私钥/合约 → dryRun + willEmit；真写必须带非零 `bytes32` 名片哈希） | 真写需 |

---

## 怎么跑

```bash
# 1. SDK 本地 build（@injective/agent-sdk 未发布到 npm，从源码 build）
SDK=INJECTIVE-INTEGRATION/_research/repos/injective-agent-sdk/packages/sdk
(cd "$SDK" && npm install && npm install viem@~2.47.6 && npm run build)
npm install "file:$SDK" viem@~2.47.6        # 装进副本

# 2. 装依赖 + 跑
npm install
npm run dev                                  # dev（vite 中间件挂 /api/injective）
# 或 prod：
npm run build && node server.mjs

# 3. 验证真连 testnet
curl 'localhost:5173/api/injective?tool=ping'   # → {reachable:true,sdk:true,network:testnet}

# 4. 录屏前快速验证链上证据路径（只读，不需要私钥、不打开浏览器）
npm run verify:demo

# 5. 验证 Demo 脚本仍在 180s / 3 分钟提交限制内
npm run verify:duration

# 6. 快速验证公开证据 API（只读，不需要私钥、不扫链）
npm run verify:evidence

# 7. 验证公开证据包仍是评审可展示的 public-only 契约
npm run verify:public-proof

# 8. 验证公开 GitHub 仓库、origin/main 和远端 README/证据包仍指向本参赛仓库
npm run verify:github

# 9. 验证 PPT 备注仍以 Injective 链上证明为主，且硬件边界/来源可核验
npm run verify:pitch

# 10. 验证评审 60 秒快速入口仍公开、只读、可跟走
npm run verify:judge

# 11. 验证评审简报仍能一页讲清 Injective 价值和复验路径
npm run verify:brief

# 12. 验证评审清单仍指向公开链接和本地复验命令
npm run verify:review

# 13. 验证产品 API 返回给评审的 Blockscout 主链接仍可打开
npm run verify:review-links

# 14. 验证证据包里的录屏顺序可从 Blockscout 一路走到产品 API
npm run verify:recording-order

# 15. 单独验证钱包时间线 API 与 Injective RPC 交易事实一致
npm run verify:wallet

# 16. 验证公开证据 API 的 sourceControl 锚到当前 GitHub 提交
npm run verify:source

# 17. 单独验证 ERC-8004 registry mint 事件和 agentId 43-47 注册交易
npm run verify:registry

# 18. 验证 public-plaza / agent-plaza 演示分组未漂移
npm run verify:plaza-flow

# 19. 验证公开证据包和 Injective 新星计划叙事对齐
npm run verify:nova-alignment

# 20. 验证提交入口不误指旧仓库，并固定 demo/API 路径
npm run verify:submission

# 21. 一键验证 Injective 链上证据（只读，不需要私钥）
npm run verify:injective

# 22. 录屏前验证 public-plaza / agent-plaza 前端闭环（会自动启动/关闭本地 Vite）
npm run verify:plaza

# 23. 验证 Frost Buddy 硬件桥事件契约（只读，无硬件也能跑）
npm run verify:hardware

# 也可以单独验证具体证据
node INJECTIVE-INTEGRATION/verify-demo-readiness.mjs
node INJECTIVE-INTEGRATION/verify-demo-duration.mjs
node INJECTIVE-INTEGRATION/verify-agent43.mjs
node INJECTIVE-INTEGRATION/verify-fleet.mjs
node INJECTIVE-INTEGRATION/verify-api-list-agents.mjs
node INJECTIVE-INTEGRATION/verify-chain-evidence-api.mjs
node INJECTIVE-INTEGRATION/verify-public-proof-contract.mjs
node INJECTIVE-INTEGRATION/verify-github-submission.mjs
node INJECTIVE-INTEGRATION/verify-pitch-notes.mjs
node INJECTIVE-INTEGRATION/verify-judge-quickstart.mjs
node INJECTIVE-INTEGRATION/verify-review-brief.mjs
node INJECTIVE-INTEGRATION/verify-review-checklist.mjs
node INJECTIVE-INTEGRATION/verify-recording-order.mjs
node INJECTIVE-INTEGRATION/verify-wallet-timeline-api.mjs
node INJECTIVE-INTEGRATION/verify-source-control.mjs
node INJECTIVE-INTEGRATION/verify-registry-events.mjs
node INJECTIVE-INTEGRATION/verify-plaza-flow.mjs
node INJECTIVE-INTEGRATION/verify-nova-alignment.mjs
node INJECTIVE-INTEGRATION/verify-submission-pack.mjs
node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs
node INJECTIVE-INTEGRATION/verify-api-write-boundaries.mjs
node INJECTIVE-INTEGRATION/verify-registry-events.mjs
node INJECTIVE-INTEGRATION/verify-wallet-flow.mjs
node INJECTIVE-INTEGRATION/verify-chain-timeline.mjs
node INJECTIVE-INTEGRATION/verify-handshake-contract.mjs
node INJECTIVE-INTEGRATION/verify-handshake.mjs
node INJECTIVE-INTEGRATION/verify-demo-links.mjs
node INJECTIVE-INTEGRATION/verify-hardware-bridge.mjs
python3 hardware/frost-buddy/raspi/frost_pi_skill_agent_smoke.py
```

### 需要的 env（副本 `.env`，server 端读、绝不进前端）
- `INJ_PRIVATE_KEY` — Injective **testnet** EVM 私钥（`0x…`，勿用主网）。真上链注册 / 握手必需。
- `INJ_NETWORK` — 默认 `testnet`（chainId 1439）。
- `PINATA_JWT`（可选）— 把 Agent Card 传 IPFS；不配则用 `CustomUrlStorage` 自托管 card.json。
- `INJ_HANDSHAKE_CONTRACT`（可选）— 部署 SocialHandshake 后的地址，配了才能真握手。

---

## 上链边界（隐私铁律）

对照《区块链书》三层判据：链只证明「上链后不可篡改」，不证明「一开始就真」，所以只存证明物、不存隐私原文。

- **上链**：agent 身份（ERC-8004 NFT）、名片哈希（fingerprint）、握手凭证、声誉分、相似度分、时间戳。
- **绝不上链**：书 / 影 / 乐 / 照片 / 心情**原文**、精确坐标、长期画像明细 —— 全留端侧 / 你的服务器。
- 所有链上**写**操作走 `suggest → confirm → sign`（无私钥 / 未 confirm 一律 dryRun），复用 Pocket Earth 的 Boundary 精神。

---

## 已上链凭证

- Frost 主身份：`agentId 43`，`builderCode = pocket-earth`，Owner/Wallet 为 `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`。
- Pocket Earth agent fleet：`agentId 43–47` 均可读回 `builderCode = pocket-earth`；44–47 的脱敏口味名片用 data URI 内联上链，无需 Pinata。`verify-fleet.mjs` 会验证这些名片只含公开字段（type/name/description/tags/metadata），metadata 只含 `chain` 和 `builderCode`。
- Registry 事件级证据：`/api/injective?tool=get-chain-evidence` 会公开返回 `registryMintEvents`，列出 `agentId 43–47` 的 mint from `0x0`、owner、交易哈希、区块号、tx 链接和身份页；`registryMintSummary` 会把 agentId 范围、同一 owner、全部 mint from `0x0`、首尾区块和 `npm run verify:registry` 复验入口汇总给评审；`reviewChecklist` 也有 `registry-mint-events` 独立检查项；`verify-registry-events.mjs` 会读取 ERC-8004 `Transfer(0x0 → wallet, tokenId)` mint 事件，核验这些公开字段没有漂移。
- 钱包证据链：注册交易 `0xd2b574...0554` 与握手交易 `0x0e597f...f2d6` 都由同一个测试网钱包发起；`verify-wallet-flow.mjs` 会核验交易 from/to、注册事件、合约代码、recordHandshake calldata、非零名片哈希和公开页面。
- 交易时间线：`/api/injective?tool=get-chain-evidence` 的公开 `timeline` 会先给每笔关键交易标出同一 `from` 钱包和 `expectedStatus: success`，`timelineSummary` 会把 owner、事件数、首尾区块/时间和 RPC 复验入口汇总给评审；`/api/injective?tool=get-wallet-timeline` 也返回 RPC 推导出的 `summary`，不用展开 7 笔交易就能先看到 owner、事件数、成功状态和首尾区块/时间；`verify-chain-timeline.mjs` 会再通过 Injective testnet JSON-RPC 直接读取注册、合约部署、fleet 注册和真实握手的 transaction / receipt / block，核验区块号、UTC 时间戳、from/to 与成功状态，作为钱包页录屏的机器可复验证据。
- 防漂移数据源：`chain-proof-data.mjs` 集中维护公开钱包、IdentityRegistry、SocialHandshake 和 7 笔时间线交易；产品 API、RPC 时间线验证和文档链接检查共用同一份公开事实表，避免演示接口、证据脚本和评审文档各写一份导致不一致。
- SocialHandshake 合约：`0xe5338a162a44a685201e1f6120b1a851949e3aee`；部署交易 `0x6048425a...fa722` 由比赛钱包 nonce 2 创建。`verify-handshake-contract.mjs` 会核验这笔部署交易、合约地址推导、交易 input 与本地 creation bytecode 一致、代码在 Frost 注册后且握手前出现，并重新编译本仓库的 `SocialHandshake.sol` 比对 Injective testnet runtime bytecode。
- 真实握手交易：`0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6`，`verify-handshake.mjs` 会用公开脱敏 demo seed 重算两个 profileHash，并核验 calldata 与事件参数均为 `agentA 43`、`agentB 44`、`score 88`，以及两个非零 `bytes32` 名片哈希字段与事件时间戳。
- Frost Buddy 硬件桥：`hardware/frost-buddy/` 把 `music-agent` 播放事件和 `public-plaza` 链上见闻转成 JSONL，供 Raspberry Pi / BLE / TTS 适配器消费；`raspi/frost_pi_skill_agent.py` 则把树莓派侧的松散语音请求路由到音乐命令或 `chain_dispatch` 公开事件；`verify-hardware-bridge.mjs` 会核验事件只包含公开字段，不包含私钥、密钥名、画像原文或 `bytes32` 名片哈希。

评审 60 秒快速入口见 `JUDGE-QUICKSTART.md`，完整复验证据包见 `CHAIN-EVIDENCE.md`。这些证据可用 `npm run verify:injective` 复验；其中 `verify-api-list-agents.mjs` 会直接调用项目自己的 `/api/injective?tool=list-agents&builderCode=pocket-earth` 处理器，确认产品后端能从 Injective testnet 按 builderCode 读回并解码这组链上 agent；`verify-demo-duration.mjs` 会解析 `DEMO-SCRIPT.md` 分镜时间轴，确认脚本仍在 180s / 3 分钟提交限制内；`verify-api-read-tools.mjs` 会验证 `ping`、`get-status`、`get-reputation`、`get-chain-evidence`、`get-wallet-timeline` 五个只读工具，并确认产品 API 输出的公开证据包与 `chain-proof-data.mjs` 的事实表一致，且内含 `registryMintEvents`、汇总 Registry mint 范围的 `registryMintSummary`、带 `from` / `expectedStatus` 的钱包 `timeline`、汇总钱包证据范围的 `timelineSummary`、`reviewBrief`、`reviewLinks`、`reviewChecklist`、`competitionAlignment`、`submissionLinks`、`submissionChecklist`、`sourceControl`、`recordingOrder`、`privacyBoundary`、`plazaFlow`、`npm run verify:demo` / `npm run verify:duration` / `npm run verify:evidence` / `npm run verify:public-proof` / `npm run verify:github` / `npm run verify:source` / `npm run verify:registry` / `npm run verify:pitch` / `npm run verify:judge` / `npm run verify:brief` / `npm run verify:review` / `npm run verify:review-links` / `npm run verify:recording-order` / `npm run verify:wallet` / `npm run verify:plaza-flow` / `npm run verify:nova-alignment` / `npm run verify:submission` / `npm run verify:injective` 复验入口；`verify-public-proof-contract.mjs` 会把公开证据包当成评审可展示契约，集中检查字段白名单、Registry mint 事件字段、Registry mint 摘要、钱包 timeline / timelineSummary 字段、源码提交锚点、公开 URL、复验命令、旧仓库误指和私钥/本地路径泄露；`verify-github-submission.mjs` 会确认 `origin/main`、GitHub 公开仓库状态、远端 README、集成说明、证据包和录屏脚本都仍指向本 Injective 参赛仓库；`verify-source-control.mjs` 会确认证据 API 的 `sourceControl` 指向当前 `Pocket-Earth-Injective` 仓库、`main` 分支和本地 HEAD 提交；`verify-registry-events.mjs` 会读取 ERC-8004 Registry 的 `Transfer(0x0 -> owner, tokenId)` mint 事件，单独确认 `agentId 43-47` 的注册交易哈希、区块和同一 owner 钱包；`verify-pitch-notes.mjs` 会确认 pitch 备注以 Injective 链上证据为主、硬件 Frost Buddy 只作为边界清楚的延展，并核验 Raspberry Pi 来源可打开；`verify-judge-quickstart.mjs` 会确认 `JUDGE-QUICKSTART.md` 中的一页评审路径、Blockscout 链接、三个只读产品 API 和本地命令仍公开可跟走；`verify-review-brief.mjs` 会确认评审简报用一句话、4 张 Injective 核心证明卡、3 条比赛主题映射和 4 步评审路径讲清项目，不误指旧仓库也不泄露私钥；`verify-review-checklist.mjs` 会确认评审清单里的每条证据都指向存在的公开链接 key 和本地复验命令；`verify-review-links.mjs` 会从产品 API 读取 `reviewLinks`，逐项比对事实表并实际打开 Injective Blockscout 页面；`verify-recording-order.mjs` 会按证据包里的 `recordingOrder` 依次打开 #43、钱包页、公开证据 API、builderCode fleet API、钱包时间线 API，并确认最后的 plaza smoke 命令存在；`verify-wallet-timeline-api.mjs` 会单独核验产品 API 返回的钱包交易时间线与注册、部署、fleet 和真实握手的 RPC 事实表一致；`verify-plaza-flow.mjs` 会确认 `public-plaza` 只负责链上社交发现，`agent-plaza` 只负责 agent 市集和安装闭环，且三段 UI smoke 脚本都存在；`verify-nova-alignment.mjs` 会确认公开证据包把 AI 社交、Injective 链上执行层、Agent × 物理世界硬件延展和隐私公开证明映射到已有复验命令；`verify-submission-pack.mjs` 会确认 GitHub 参赛仓库、线上 `?demo` 入口、三个公开 API 复验路径和提交要求清单没有误指旧仓库；`verify-api-write-boundaries.mjs` 会验证注册和握手在无私钥 / 未确认时只返回 dry-run 预览、不产生交易；`verify-chain-timeline.mjs` 会读取 RPC 交易/区块时间线；`verify-demo-links.mjs` 会确认 README、证据包与录屏脚本里的公开 Blockscout 证据页仍可打开；`verify-hardware-bridge.mjs` 会确认硬件播报桥只接收公开事件。写链能力仍只在 testnet、server 端私钥、显式 confirm 的边界内启用。

详见 `PLAN.md`（完整方案 + Demo 5 幕 + Pitch 要点）、`RESEARCH.md`（agent-sdk API 精读）、`PROGRESS.md`（断点续作清单）。

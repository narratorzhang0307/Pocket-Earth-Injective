# Injective × Pocket Earth — Frost Passport on Injective

> **一句话**：Pocket Earth 让每个人的 Frost 在 Injective 上拥有一个链上身份；它白天带着你**同意公开的脱敏口味名片**去地球广场遇见相似 agent，夜里回来用人话汇报链上见闻。私人记忆原文**永不上链**。

为 Injective 新星计划做的集成。命中赛事方向「AI 社交」+「Agent × 物理世界」（硬件 Frost 播报）。不是交易 bot，而是把 ERC-8004 agent 身份层用在「记忆 / 探索 / 社交」场景。

---

## 已实现（截至 `npm run build` 编译净）

| 能力 | 文件 | 状态 |
|---|---|---|
| Taste Passport 脱敏名片（只导标签字符串、不含原文 / 热度） | `src/app/lib/injective/passport.ts` | ✅ |
| `/api/injective` 服务（ping / list-agents / get-status / register / handshake） | `injective-service.mjs` | ✅ |
| server + dev 双挂路由 | `server.mjs` / `vite.config.ts` | ✅ |
| **真连 Injective testnet**（ping `reachable:true`） | — | ✅ |
| Agent Plaza 读链上真实 agent（空 / 失败回落示意不白屏） | `PublicPlazaPage.tsx` | ✅ |
| 链上 agent 钉地球（新 `'agent'` 标记类型） | `mapMarkers.ts` | ✅ |
| Nightly Chain Dispatch 夜间链上见闻报告 | `PublicPlazaPage.tsx` | ✅ |
| `SocialHandshake.sol` 握手合约（只存哈希 / 身份 / 相似度 / 时间戳） | `INJECTIVE-INTEGRATION/contracts/` | ✅ 代码 |
| register / handshake 真写逻辑（dryRun 闸门，待私钥 + 合约部署） | `injective-service.mjs` | 🟡 骨架 |

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
   │  （未来）BLE → 树莓派硬件 Frost 播报
```

---

## API

| 方法 | 端点 | 返回 | 私钥 |
|---|---|---|---|
| GET | `/api/injective?tool=ping` | `{reachable, sdk, network}` | 否 |
| GET | `?tool=list-agents&limit=20` | `{agents, total}` | 否 |
| GET | `?tool=get-status&agentId=N` | StatusResult | 否 |
| POST | `?tool=register` `{passport, confirm}` | `{agentId, txHashes, scanUrl}`（无私钥/未 confirm → dryRun + gasEstimate） | 真写需 |
| POST | `?tool=handshake` `{agentA, agentB, score, confirm}` | `{txHash}`（无私钥/合约 → dryRun + willEmit） | 真写需 |

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

# 4. 验证 Frost 主身份 agentId 43（builderCode 必须读回 pocket-earth）
node INJECTIVE-INTEGRATION/verify-agent43.mjs
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

## 待用户提供（只卡真上链，前面全部可跑）

1. **`INJ_PRIVATE_KEY`**（testnet）→ 副本 `.env`
2. 用该地址去[水龙头](https://testnet.faucet.injective.network/)领 testnet INJ 付 gas

一到位即可：真·注册 Frost 链上身份（8004scan 可查）→ 部署握手合约 → 真握手上链。

详见 `PLAN.md`（完整方案 + Demo 5 幕 + Pitch 要点）、`RESEARCH.md`（agent-sdk API 精读）、`PROGRESS.md`（断点续作清单）。

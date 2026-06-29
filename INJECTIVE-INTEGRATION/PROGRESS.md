# Pocket Earth × Injective Progress

> 当前重点：先把 Injective 链上身份、公开证据、API 复验、plaza 分组和硬件事件桥打磨稳定，再继续迭代 Pocket Earth 的非链上体验。

## 当前状态（2026-06-29）

- **公开仓库边界**：当前工作目录为 `Pocket-Earth-Injective`，远端为 `https://github.com/narratorzhang0307/Pocket-Earth-Injective`，自动化只在这个仓库内工作。
- **ERC-8004 身份**：Frost 主身份 `agentId 43` 已在 Injective testnet 注册，`builderCode = pocket-earth`，Owner 为 `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`。
- **Agent 身份簇**：`agentId 43-47` 均可通过 `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47` 读回。
- **SocialHandshake**：合约 `0xe5338a162a44a685201e1f6120b1a851949e3aee` 已部署；真实握手交易记录 `agentId 43 <-> 44`、score `88` 与非零公开承诺哈希。
- **公开证据 API**：`/api/injective?tool=get-chain-evidence` 返回 `chainId 1439`、`readOnly: true`、`publicOnly: true`，并包含身份、mint、钱包、握手、Frost Edge Node 硬件入口、隐私边界、源码锚点和复验入口。
- **钱包时间线**：`/api/injective?tool=get-wallet-timeline` 从 RPC 读回注册、合约部署、fleet 注册和真实握手的交易顺序，`summary` 汇总 owner、事件数、成功状态、首尾区块/时间。
- **plaza 产品闭环**：`public-plaza` 负责链上社交发现，`agent-plaza` 负责 agent 市集与安装闭环；`verify:plaza-flow` 固定两者边界。
- **Frost Buddy 硬件延展**：`hardware/frost-buddy/` 已整理为 Frost Edge Node 模块说明，覆盖 Raspberry Pi / BLE / TTS 公开事件桥、Pi 侧技能路由、music-agent 实体化、`chain_dispatch` 链上见闻播报、市场边界与隐私边界。
- **最终整合版覆盖**：根 `README.md` 已新增 `5.1 最终整合版对照与技术深挖`；`INJECTIVE-INTEGRATION/README.md#final-ppt-index` 已按最终 PPT 41 页建立逐页覆盖索引，并展开 Profile Chain / Proof of Memory、frost-agent harness、Agent Plaza / Frost Buddy 与外部来源边界。

## 核心证据层

| 层 | 已落地 | 复验 |
|---|---|---|
| 身份层 | ERC-8004 `agentId 43` 与 `agentId 43-47` fleet | `npm run verify:agent-proof` / `npm run verify:registry` |
| 钱包层 | 同一 owner 钱包串起注册、部署、fleet、握手 | `npm run verify:wallet` |
| 合约层 | SocialHandshake 只记录 agentId、承诺哈希、score、timestamp | `npm run verify:injective` |
| API 层 | `get-chain-evidence`、`get-agent-proof`、`list-agents`、`get-wallet-timeline` | `npm run verify:public-apis` |
| 文档层 | README、集成说明、证据包、录制脚本、60 秒复验入口，以及最终 PPT 逐页覆盖索引 | `npm run verify:github` / `npm run verify:integration-guide` |
| 产品层 | public-plaza 读链上 agent；agent-plaza 保留安装闭环 | `npm run verify:plaza-flow` / `npm run verify:plaza` |
| 硬件层 | JSONL 公开事件桥 + Pi 技能路由 + Frost Edge Node 文档锚点 | `npm run verify:hardware` |

## 当前文档结构

- `README.md`：对外总览，按空间知识库、frost-agent harness、Frost Passport、Profile Chain、Agent Plaza、Frost Edge Node 分层；`5.1 最终整合版对照与技术深挖` 把 PPT 页段映射到技术落点和复验入口。
- `INJECTIVE-INTEGRATION/README.md`：Injective 核心集成说明，先用叙事骨架对齐“把地球作为方法 / Frost 起源 / 一条线走完 / 三入口一颗地球 / 端云双脑 / Frost Buddy”，再用 `final-ppt-index` 逐页覆盖 41 页主线；后半部分展开 `recordHash -> domainRoot -> ProfileRoot -> profileHash`、`ProfileCheckpoint`、Profile Confidence、FrostBus / RunTrace、SSE `x-accel-buffering:no`、`reviewManifest`、`toManifest`、`agentGeo` / FNV-1a、Frost Edge Node 硬件原理、树莓派市场边界和外部来源边界。
- `INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md`：公开证据索引，提供 Blockscout、RPC、API 与本地验证命令。
- `INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md`：60 秒只读复验路径，包含 `reviewEntrypoints.hardware-bridge`、`deliveryChecklist.frost-edge-node`、`recordingOrder[].evidenceFocus` 的 Frost Edge Node `chain_dispatch` handoff 和 `npm run verify:hardware`，让硬件入口也在最快复验页里可见。
- `INJECTIVE-INTEGRATION/DEMO-SCRIPT.md`：3 分钟以内录制脚本，镜头优先级是 `agentId 43`、钱包页、public-plaza、地球 agent 标记、Nightly Chain Dispatch、隐私边界。

## 自动化检查

常用快检：

```bash
npm run verify:public-proof
npm run verify:public-apis
npm run verify:integration-guide
npm run verify:github
npm run verify:positioning
npm run verify:source
npm run verify:registry
npm run verify:wallet
npm run verify:plaza-flow
npm run verify:hardware
npm run verify:delivery
npm run verify:demo
```

`verify:integration-guide` 现在会固定 `final-ppt-index`、Agent Personality Provenance、Proof of Memory、`ProfileCheckpoint`、FrostBus、RunTrace、`reviewManifest`、FNV-1a、`willEmit` 和外部来源边界，防止最终整合版的技术深度在后续文档修改中被改丢。`verify:positioning` / `verify:github` 会固定 README 的明确标题：`Pocket Earth 是什么` 和 `三入口，一颗地球`，并要求本地与远端 GitHub 的 Frost Edge Node、hardware README、public-plaza UI 明确写出主语，避免再次退回指代不明或 UI 术语化标题。

完整链上复验：

```bash
npm run verify:injective
npm run verify:plaza
npm run verify:hardware
```

## 下一步优先级

1. 继续保持 `agentId 43` 单页、钱包页、`builderCode=pocket-earth` fleet API 和钱包时间线 API 的录制路径清晰。
2. 让 `public-plaza` 的链上 agent 分组和 `agent-plaza` 的安装闭环保持可独立说明、可独立复验。
3. Profile Chain P1 只做 checkpoint 设计：`profileHash + version + timestamp + signature`，原始画像继续不上链。
4. Frost Buddy 继续作为 Frost Edge Node 轻量硬件节点表达：music-agent 实体化 + 链上见闻播报，只消费公开事件；硬件是体验差异化与开发套件，不写成当前收入支柱。
5. 每轮自动化只做一个真实改进，跑对应验证后只纳入本轮相关文件；不碰旧仓库、不 force push、不改仓库可见性。

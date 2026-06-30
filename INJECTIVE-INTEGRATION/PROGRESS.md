# Pocket Earth × Injective Progress

> 当前重点：先把 Injective 链上身份、公开证据、API 复验、plaza 分组和硬件事件桥打磨稳定，再继续迭代 Pocket Earth 的非链上体验。

## 当前状态（2026-06-30）

- **公开仓库边界**：当前工作目录为 `Pocket-Earth-Injective`，远端为 `https://github.com/narratorzhang0307/Pocket-Earth-Injective`，自动化只在这个仓库内工作。
- **ERC-8004 身份**：Frost 主身份 `agentId 43` 已在 Injective testnet 注册，`builderCode = pocket-earth`，Owner 为 `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`。
- **Agent 身份簇**：`agentId 43-47` 均可通过 `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47` 读回。
- **SocialHandshake**：合约 `0xe5338a162a44a685201e1f6120b1a851949e3aee` 已部署；真实握手交易记录 `agentId 43 <-> 44`、score `88` 与非零公开承诺哈希。
- **公开证据 API**：`/api/injective?tool=get-chain-evidence` 返回 `chainId 1439`、`readOnly: true`、`publicOnly: true`，并包含身份、mint、钱包、握手、`hardwareBridge` 结构化硬件桥、`hardwareBridge.serviceBoundary` 硬件节点服务回执边界、`hardwareBridge.roadmapBoundary` 硬件路线图边界、`marketLandscapeBoundary` 市场边界机器字段、`roadmapSafetyBoundary` 产品/链上路线图安全边界、隐私边界、源码锚点和复验入口；`/api/injective?tool=get-hardware-bridge-proof` 可单独打开 Frost Edge Node 证明卡。
- **钱包时间线**：`/api/injective?tool=get-wallet-timeline` 从 RPC 读回注册、合约部署、fleet 注册和真实握手的交易顺序，`summary` 汇总 owner、事件数、成功状态、首尾区块/时间。
- **plaza 产品闭环**：`public-plaza` 负责链上社交发现，`agent-plaza` 负责 agent 市集与安装闭环；`verify:plaza-flow` 固定两者边界。
- **Frost Buddy 硬件延展**：`hardware/frost-buddy/` 已整理为 Frost Edge Node 模块说明，覆盖 Raspberry Pi / BLE / TTS 公开事件桥、Pi 侧技能路由、Pi 事件适配分支、music-agent 实体化、`chain_dispatch` 链上见闻播报、市场边界、`hardwareNodeServiceReceipt` 服务回执边界、路线图边界与隐私边界；`frost_pi_event_adapter.py` 把公开 JSONL 拆成 `state` / `tts` / `display` 三类动作，不影响主 app、plaza 或链上 API，真实 BLE/TTS/display 驱动仍留在可选 adapter 层。
- **商业路径边界**：根 `README.md` 已新增 `5.3 商业路径与三条边界`，明确不走纯社交变现、不走代币优先、不走重资本硬件路线；`marketLandscapeBoundary` 进一步固定 `commercialFlywheel`、`preferredPath`、`rejectedPaths` 和 `differentiation`，让“长期使用 -> 可信画像 -> Agent 市场”成为可机读证据；Agent Plaza 是安装、调用、评价和可选付费回执的中心。
- **最终整合版覆盖**：根 `README.md` 已新增 `5.1 最终整合版对照与技术深挖`、`5.2 Frost Edge Node：树莓派硬件原理与市场边界`、`5.3 商业路径与三条边界`；`INJECTIVE-INTEGRATION/README.md#final-ppt-index` 已按最终 PPT 41 页建立逐页覆盖索引，并展开 Profile Chain / Proof of Memory、frost-agent harness、Agent Plaza / Frost Buddy、三条商业边界与外部来源边界；PPT 第一页的公开视频 `https://youtu.be/KjmrjTnvVo0` 已固定为 `reviewEntrypoints.demo-video` 与 `deliveryChecklist.demo-video-script`。

## 核心证据层

| 层 | 已落地 | 复验 |
|---|---|---|
| 身份层 | ERC-8004 `agentId 43` 与 `agentId 43-47` fleet | `npm run verify:agent-proof` / `npm run verify:registry` |
| 钱包层 | 同一 owner 钱包串起注册、部署、fleet、握手 | `npm run verify:wallet` |
| 合约层 | SocialHandshake 只记录 agentId、承诺哈希、score、timestamp | `npm run verify:injective` |
| API 层 | `get-chain-evidence`、`get-agent-proof`、`list-agents`、`get-wallet-timeline`、`get-hardware-bridge-proof` | `npm run verify:public-apis` |
| 文档层 | README、集成说明、证据包、录制脚本、60 秒复验入口，以及最终 PPT 逐页覆盖索引 | `npm run verify:github` / `npm run verify:integration-guide` |
| 产品层 | public-plaza 读链上 agent；agent-plaza 保留安装闭环 | `npm run verify:plaza-flow` / `npm run verify:plaza` |
| 硬件层 | JSONL 公开事件桥 + Pi 技能路由 + Pi 事件适配分支 + `hardwareBridge.serviceBoundary` + `hardwareBridge.roadmapBoundary` + Frost Edge Node 文档锚点 | `npm run verify:hardware` |
| 市场边界层 | `marketLandscapeBoundary` 固定 `commercialFlywheel`、`Agent Plaza platform path`、`rejectedPaths` 和四项差异化；商业主线是 Agent Plaza，不是纯社交、代币优先或硬件收入优先 | `npm run verify:public-proof` / `npm run verify:public-apis` |
| 路线图安全层 | `roadmapSafetyBoundary` 固定 P0/P1/P2 产品路线和 NOW/P1/P2/P3/P4 链上路线：只建议不偷改、声明式 skill、不无确认写链、原始记忆不上链、硬件不签名 | `npm run verify:public-proof` / `npm run verify:judge` |

## 当前文档结构

- `README.md`：对外总览，按空间知识库、frost-agent harness、Frost Passport、Profile Chain、Agent Plaza、Frost Edge Node 分层；`5.1 最终整合版对照与技术深挖` 把 PPT 页段映射到技术落点和复验入口，并补充作者方法来源只作为产品方法解释、链上证明仍以仓库/API/交易为准；`5.3 商业路径与三条边界` 把商业判断收束为“不走纯社交变现 / 不走代币优先 / 不走重资本硬件路线”，并用 `marketLandscapeBoundary`、`commercialFlywheel`、`preferredPath`、`rejectedPaths` 把市场判断接入公开证据包。
- `INJECTIVE-INTEGRATION/README.md`：Injective 核心集成说明，先用叙事骨架对齐“把地球作为方法 / Frost 起源 / 一条线走完 / 三入口，一颗地球 / 端云双脑 / Frost Buddy”，再用 `final-ppt-index` 逐页覆盖 41 页主线；后半部分展开 PPT 第 2 页作者方法来源与证据边界（独立开发闭环、小说作者与叙事训练、建筑/空间背景、文学奖项与内容运营、个人网站与作品入口）、“一条线走完：从票根到链上见闻”、`recordHash -> domainRoot -> ProfileRoot -> profileHash`、`ProfileCheckpoint`、Profile Confidence、FrostBus / RunTrace、SSE `x-accel-buffering:no`、Skills 能力沉淀与依赖边界、skill 三个家目录与“路由器不是仓库”的单向依赖规则、`reviewManifest`、`toManifest`、`agentGeo` / FNV-1a、Frost Edge Node 硬件原理、Pi 事件适配分支、树莓派市场边界、PPT 第 34 页反面坐标、三条商业边界、外部来源边界、用户痛点与对症解决，以及 PPT 第 40-41 页的 FROST Chronicle / 现在能打开 / 三件交付收尾。
- `INJECTIVE-INTEGRATION/README.md` 的“用户痛点与对症解决”已经把 `散落各处`、`按时间记不牢`、`隐私不敢交`、`整理太费劲` 对应到地球索引、端云双脑、skill 沉淀和链上身份；`Roadmap 与安全边界` 已拆成 `产品演进路线` 与 `链上信誉网络路线` 两张表，区分 P0/P1/P2 自学能力和 NOW/P1/P2/P3/P4 链上信誉网络，并固定 `heartbeat 建议引擎`、`学习型 skill + 安全闸`、`真 SSE 流式渲染`、`只建议不偷改`、`Frost Network` 等最终路线图要点。
- `INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md`：公开证据索引，提供 Blockscout、RPC、API 与本地验证命令。
- `INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md`：60 秒只读复验路径，包含 `reviewEntrypoints.demo-video`、`hardwareBridge`、`reviewEntrypoints.hardware-bridge-api`、`reviewEntrypoints.hardware-bridge`、`deliveryChecklist.frost-edge-node`、`recordingOrder[].evidenceFocus` 的独立 Frost Edge Node 硬件证明 API，以及后续 public-plaza / agent-plaza smoke，让硬件入口不再藏在 plaza 描述里；同页的 `Pocket Earth Roadmap And Safety Boundary Fast Check` 已把 P0 core / P1 compatibility / P2 self-learning 与 NOW chain identity and handshake / Profile Checkpoint / Agent Plaza receipts / Profile Confidence / P4 Frost Network 合成一张速查表，并写明 raw memories never go on-chain、only identity / versions / receipts / selective proofs go on-chain、Frost Edge Node remains a developer-kit / experience layer；`Profile Confidence Fast Check` 把 L0-L4 写成来源支撑而非人格评分；`FROST Chronicle Delivery Fast Check` 把 PPT 第 40-41 页的“画像演化史、现在能打开、三件交付、Built on Injective”收束到 public demo video、live demo、GitHub、只读 API、钱包时间线和交付清单。
- `INJECTIVE-INTEGRATION/DEMO-SCRIPT.md`：3 分钟以内录制脚本，镜头优先级是 `agentId 43`、钱包页、public-plaza、地球 agent 标记、Nightly Chain Dispatch、隐私边界；开头新增 `Pocket Earth 30 秒主线讲法`，把用户痛点、地球索引、Injective 公共见证、Frost Edge Node 和 Agent Plaza 商业边界压成录屏口播骨架。

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

`verify:integration-guide` 现在会固定 `final-ppt-index`、PPT 第 2 页作者方法来源细项、Agent Personality Provenance、Proof of Memory、`ProfileCheckpoint`、FrostBus、RunTrace、Skills 能力沉淀与依赖边界、`路由器不是仓库`、三个家目录、`curatePlaylist`、`MNN / ollama / stub`、`reviewManifest`、FNV-1a、`willEmit`、`产品演进路线`、`链上信誉网络路线`、`P2 自学`、`NOW 链上身份与握手`、三条商业边界和外部来源边界，防止最终整合版的技术深度在后续文档修改中被改丢。`verify:positioning` / `verify:github` 会固定 README 的明确标题：`Pocket Earth 是什么`、`三入口，一颗地球` 和 `Agent 产出 ⇄ 地球入口实时联动`，并要求本地与远端 GitHub 的 Frost Edge Node、hardware README、public-plaza UI、地图联动注释和 plaza 验证脚本都写出明确主语，避免再次退回指代不明或 UI 术语化标题。

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
4. Agent Plaza 继续承接商业路径：先用 `manifest / schema / permissions`、`reviewManifest`、`toManifest` 和 `willEmit` 把安装闭环讲清楚，再规划安装、调用、评价和可选付费回执。
5. Frost Buddy 继续作为 Frost Edge Node 轻量硬件节点表达：music-agent 实体化 + 链上见闻播报，只消费公开事件；Pi adapter 分支只做 `state` / `tts` / `display` 动作翻译，硬件是体验差异化与开发套件，不写成当前收入支柱；未来硬件节点服务必须作为 Agent Plaza 服务回执，而不是独立硬件收入主线。
6. 每轮自动化只做一个真实改进，跑对应验证后只纳入本轮相关文件；不碰旧仓库、不 force push、不改仓库可见性。

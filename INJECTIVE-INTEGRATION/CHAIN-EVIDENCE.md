# Chain Evidence · Pocket Earth on Injective

> 公开复验入口：本页只列公开链上证据。所有链接指向 Injective testnet Blockscout；私人画像原文、书影音原文、精确坐标和私钥不在本页、也不在链上。

## 一眼结论

- Network: Injective testnet, chainId `1439`
- IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Builder code: `pocket-earth`
- Owner / wallet: `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`
- Main Frost identity: `agentId 43`
- Fleet identities: `agentId 43-47`
- SocialHandshake: `0xe5338a162a44a685201e1f6120b1a851949e3aee`

## Reviewer Checklist

Start with `JUDGE-QUICKSTART.md` for the 60-second path. The evidence is organized in layers, so a reviewer can stop at the highest layer they need:

| Layer | Public artifact | What it proves |
|---|---|---|
| Identity | `agentId 43`, `agents[].proofApi`, `get-agent-proof&agentId=43` | Frost has a public ERC-8004 identity owned by `0x6D5A...C934` |
| Fleet | `registryMintEvents`, `registryMintSummary`, `list-agents&builderCode=pocket-earth` | `agentId 43-47` were minted from `0x0` to the same owner and are readable by builderCode |
| Wallet timeline | `timeline`, `timelineSummary`, `get-wallet-timeline` | registration, contract deployment, fleet minting, and real handshake share one successful wallet sequence |
| Social proof | `handshakeProof` | `agentId 43 <-> 44` produced a real SocialHandshake event with score `88` and non-zero public commitments |
| Product loop | `publicReadApis`, `hardwareBridge`, `hardwareBridge.piAdapter`, `hardwareBridge.marketBoundary`, `hardwareBridge.serviceBoundary`, `hardwareBridge.roadmapBoundary`, `get-hardware-bridge-proof`, `plazaFlow`, `recordingOrder[].evidenceFocus` | public-plaza reads the chain; agent-plaza keeps the install loop separate; Frost Edge Node receives only public event handoffs, turns them into `state/tts/display` adapter actions, keeps BLE/TTS/display drivers as optional adapter layers, and routes any future hardware-node service monetization back into Agent Plaza service receipts |
| Market landscape | `marketLandscapeBoundary`, `commercialFlywheel`, `preferredPath`, `rejectedPaths`, `differentiation` | the commercial thesis is machine-readable: long-term use grows trusted profiles, Agent Plaza is the platform path, and pure social monetization / token-first / hardware-revenue-first paths are explicitly rejected |
| Roadmap safety | `roadmapSafetyBoundary` | P0/P1/P2 product evolution and NOW/P1/P2/P3/P4 chain roadmap stay tied to always-on limits: suggest-only behavior, declarative skills, testnet confirm writes, no raw memories on-chain, and no wallet signing on hardware |
| Delivery guard | `reviewBrief`, `judgeRunbook`, `reviewChecklist`, `integrationAlignment`, `reviewEntrypoints`, `reviewEntrypoints.demo-video`, `deliveryChecklist`, `deliveryChecklist.demo-video-script`, `sourceControl` | the docs, API fields, public demo video, hardware bridge entrypoint, source anchor, privacy boundary, and reproduction commands stay aligned |

The public demo video is fixed in the evidence package as `reviewEntrypoints.demo-video`: https://youtu.be/KjmrjTnvVo0. The core smoke path is: `npm run verify:public-proof`, `npm run verify:public-apis`, `npm run verify:positioning`, `npm run verify:registry`, `npm run verify:wallet`, `npm run verify:plaza-flow`, `npm run verify:hardware`, and `npm run verify:demo`.

| Check | Public evidence | Pass criteria |
|---|---|---|
| ERC-8004 identity ownership | Frost main identity #43 | #43 belongs to `0x6D5A...C934`, uses `builderCode = pocket-earth`, and points to the Injective IdentityRegistry |
| Pocket Earth agent fleet | `list-agents&builderCode=pocket-earth` | `agentId 43-47` are read back from Injective testnet; the response exposes top-level `sdk/total/offset/limit`, each row exposes `owner/wallet/identityTuple/builderCode`, and #44-47 expose only `card.tags` / `card.metadata.builderCode` public data URI card fields |
| Wallet evidence chain | Owner wallet + RPC timeline API | registration, SocialHandshake deployment, fleet registration, and the real handshake are sent by the same wallet in block order |
| Real SocialHandshake proof | Contract + real handshake tx | call/event decode to `agentA 43`, `agentB 44`, `score 88`, with two non-zero Taste Passport commitments |
| Public-only privacy boundary | Public evidence API | evidence is marked `readOnly` / `publicOnly`; raw books, films, music, photos, moods, precise locations, and private keys stay off-chain |
| Product demo loop | Plaza UI smoke | `public-plaza` reads Injective agents and pins them to the globe; `agent-plaza` keeps the install loop demonstrable |

## 公开证据如何支撑 Agent Plaza 商业路径

最终整合版第 30-35 页的商业判断可以用本页证据直接复验：Pocket Earth 不把链上身份写成单纯社交噱头，也不把 Frost Edge Node 写成短期硬件收入，而是把长期空间知识库、公开身份和 Agent Plaza 安装闭环接成一条可验证路径。

| Boundary | Evidence in this repo | Why it matters |
|---|---|---|
| 不走纯社交变现 | `public-plaza` 只读取 `agentId 43-47`、`builderCode=pocket-earth`、SocialHandshake 和 `agentGeo` 稳定钉点 | 链上社交只负责发现和握手留痕，价值仍回到 Pocket Earth 的长期画像和空间知识库 |
| 不走代币优先 | `ProfileCheckpoint` 路线只规划身份、版本、时间戳、签名和回执；当前 API 标记 `readOnly: true` / `publicOnly: true` | Injective 先承担公共身份层、画像版本见证层和未来结算入口，不用代币发行替代产品闭环 |
| 不走重资本硬件路线 | `hardwareBridge.piAdapter`、`hardwareBridge.marketBoundary`、`hardwareBridge.serviceBoundary`、`hardwareBridge.roadmapBoundary`、`get-hardware-bridge-proof`、`hardware/frost-buddy/` | Frost Edge Node 是 Raspberry Pi / BLE / TTS 开发套件和体验差异化，只消费公开 JSONL 事件；Pi adapter 只产出 `state/tts/display` 动作，不接触私钥、画像原文或精确坐标；真实驱动留在可选 adapter 层；未来硬件节点服务必须形成 Agent Plaza 服务回执 |
| Agent Plaza 承接收入闭环 | `agent-plaza` 的 `manifest / schema / permissions`、`reviewManifest`、`toManifest`、`INSTALL -> My Agents -> RUN` | 未来安装、调用、评价和可选付费回执可以回流到 Profile Confidence，形成“长期使用 -> 可信画像 -> Agent 市场”的路径 |

这也是本页要把 `plazaFlow` 和 `hardwareBridge` 放在同一个证据层的原因：`public-plaza` 证明 Frost 能读公开链上 agent 并进行可追踪社交，`agent-plaza` 证明符合空间逻辑的 agent 可以被审核、安装和运行，Frost Edge Node 证明同一套公开事件还能被实体节点消费。三者共同支撑的不是“发币社交”，而是一个隐私自持、身份可验、回执可追踪的空间 Agent 市场。

`hardwareBridge.serviceBoundary` 补上 PPT 第 31 页“硬件节点服务”的工程边界：如果未来硬件节点服务收费，只能使用 `hardwareNodeServiceReceipt(agentId, serviceId, eventHash, resultHash, timestamp)` 这类 Agent Plaza 服务回执。允许的服务是 `chain_dispatch` 播报、`music_now_playing` 房间存在感、用户明确同意后的每日记忆或播客摘要；禁止私人画像导出、钱包签名、原始照片/票据上传和量产收入承诺。

`marketLandscapeBoundary` 是这段商业判断的机器可读版本：`commercialFlywheel` 固定长期使用、可信公开画像、Agent Plaza 供给、安装/调用/评价/可选付费回执和留存反哺；`preferredPath.label` 固定为 `Agent Plaza platform path`；`rejectedPaths` 固定纯社交变现、代币优先和硬件收入优先三条反面路径；`differentiation` 固定端侧隐私、真实坐标知识库、ERC-8004 公开身份和平台抽成兼容的 Agent Plaza。审阅者可以直接在 `/api/injective?tool=get-chain-evidence` 中展开这个字段，而不需要从段落里猜商业主线。

## Agent Plaza 回执如何形成收入闭环

最终整合版第 32 页把商业飞轮写成“长期使用 -> 画像可信 -> Agent 市场”。在当前仓库里，这条飞轮还不伪装成已经发生的收入，而是先落成可审核、可安装、可复验的回执槽位：只有 agent 通过 `manifest / schema / permissions` 审核，并能被用户从 `INSTALL -> My Agents -> RUN` 跑通，未来才有资格进入订阅、单次调用或平台抽成路径。

当前 `npm run verify:plaza` 会真实走一遍 cafe-map 安装：`verify-plaza-install.mjs` 从 `pe.customAgents.v1` 读回安装后的 manifest，核对 `domain=地点`、`geoStrategy`、`tagFields`、`tools=[enrich, geocode, mark_place]`，再切回 `My Agents` 确认同一个 agent 的 `RUN` 入口可见。也就是说，Agent Plaza 的“安装 -> 回流 -> 可运行”不是只写在段落里，而是有可重复的浏览器 smoke。

| Receipt stage | Current evidence | Future Injective receipt shape |
|---|---|---|
| 开发者发布 | `agent-plaza` 展示 `manifest / schema / permissions`；`reviewManifest` 拒绝未知字段、危险 URL、可执行代码和越界权限；`toManifest` 只做白名单转译 | `manifestReceipt(agentId, manifestHash, publisher, timestamp)`，只证明 manifest 版本和发布者，不写入 agent 源码或用户数据 |
| 用户安装 | `INSTALL -> My Agents -> RUN` 证明安装后能回到产品运行；`plazaFlow` 固定 public-plaza 与 agent-plaza 分工 | `installReceipt(agentId, manifestHash, userConsentHash, timestamp)`，只证明用户同意了某个公开 manifest 版本 |
| agent 调用 | `willEmit` dry-run 说明未来会发什么事件；`RunTrace` 和 `reviewChecklist` 保留调用可观测入口 | `callReceipt(agentId, runId, capability, resultHash, timestamp)`，只证明一次能力调用和公开结果摘要，不公开原始输入 |
| 用户评价 | `Profile Confidence` 已把外部回执列为 L4 佐证；当前只用 SocialHandshake、mint 顺序和钱包时间线作为公开证据 | `reviewReceipt(agentId, ratingBucket, reasonHash, timestamp)`，只记录分桶评价和原因摘要哈希，不公开长文本评价原文 |
| 可选付费 | 文档只把订阅 / 单次调用 / 平台抽成写成未来路径，当前不把它们伪装成已结算收入 | `paymentReceipt(agentId, planOrCallId, settlementRef, timestamp)`，必须在显式确认后产生，并与身份、安装和调用回执分层 |

这张表把“平台抽成”拆成工程上可追踪的五类回执：先证明 agent 合规，再证明用户安装，再证明调用发生，再证明评价来源，最后才是可选付费。Injective 的角色是见证这些公开回执的顺序和版本；Pocket Earth 的角色仍是保存空间记忆、执行 agent、保护原始画像。

## 公开证据如何支撑 Profile Chain 路线图

最终整合版第 38-40 页把路线图拆成两层：Pocket Earth 先打磨产品内核和端云双脑，再把公开画像的来源证明接到 Injective。当前链上证据已经覆盖 NOW 层，后续 P1-P4 只是在同一条证据链上增加更细的回执类型。

| Profile Chain phase | Current public proof | Next proof boundary |
|---|---|---|
| NOW 链上身份与握手 | `agentId 43-47`、`builderCode=pocket-earth`、Blockscout identity pages、同一钱包 `timelineSummary`、真实 SocialHandshake score `88` | 只证明 Frost agent 身份、mint 顺序、owner 钱包和握手事件，不公开原始画像 |
| P1 Profile Checkpoint | `get-chain-evidence` 已有 `sourceControl`、`publicReadApis`、`privacyBoundary` 和公开 Taste Passport 边界 | 未来只写 `profileHash + version + timestamp + Frost signature`，不写书单、照片、心情或精确坐标 |
| P2 Agent Plaza receipts | `agent-plaza` 已展示 `manifest / schema / permissions`、`reviewManifest`、`toManifest`、`willEmit` dry-run 和安装回流 | 安装、调用、评价和可选付费回执必须先通过权限审核，再回流 Profile Confidence |
| P3 Profile Confidence | `handshakeProof`、`registryMintSummary`、`timelineSummary` 和 `reviewChecklist` 已能证明身份连续性、同钱包顺序和公开社交佐证 | 置信度只评估公开画像来源支撑；批量导入、短期快速变脸和随机标签会被降权，不做“人好坏”评分 |
| P4 Frost Network | `hardwareBridge`、`hardwareBridge.serviceBoundary`、`get-hardware-bridge-proof`、`music_now_playing`、`chain_dispatch`、Pi skill router、Pi adapter `state/tts/display` 和 `roadmapSafetyBoundary` 已证明公开事件可被实体节点消费 | Frost Edge Node 保持 developer-kit / experience layer；设备不签名、不持私钥、不读取原始画像；硬件节点服务只作为 Agent Plaza 服务回执 |

这张表把“空间留在 Pocket Earth，时间由 Injective 见证”落成证据分工：Pocket Earth 负责长期空间记忆和公开画像生成；Injective 负责身份、版本、回执和可选择证明；Frost Edge Node 只把公开事件带回物理空间。`roadmapSafetyBoundary` 进一步把 PPT 第 38-39 页的安全线压成机器可读字段：`productRoadmap` 对应 P0/P1/P2 产品演进，`chainRoadmap` 对应 NOW/P1/P2/P3/P4 链上信誉网络，`alwaysOn` 固定主动能力只建议不偷改、skill 只走声明式路由、测试网写入必须 `confirm:true`、原始记忆不上链、硬件不签名。

## IdentityRegistry

| Evidence | Link |
|---|---|
| IdentityRegistry contract | https://testnet.blockscout.injective.network/address/0x8004A818BFB912233c491871b3d84c89A494BD9e |
| Frost main identity #43 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43 |
| Agent #44 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/44 |
| Agent #45 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/45 |
| Agent #46 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/46 |
| Agent #47 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/47 |

## Registration Transactions

| agentId | Public role | Transaction |
|---|---|---|
| 43 | Frost main identity | https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554 |
| 44 | FROST·拉美文学旅人 | https://testnet.blockscout.injective.network/tx/0x02a0590c2f1bc1e475d7cdfb2fa4c3eb5e0b9f7de4ac1f97e66663e0f5a38f44 |
| 45 | FROST·黑色电影迷 | https://testnet.blockscout.injective.network/tx/0xc161f0df707b1c9b1e29311e944b7c1b40f3d525c9d1cbd2d71c67713333fffe |
| 46 | FROST·爵士夜行者 | https://testnet.blockscout.injective.network/tx/0x1bbd3df139b2558ff315d2029f00c01dc881a45542d5854176bbc49e6dfaea4e |
| 47 | FROST·北欧极光客 | https://testnet.blockscout.injective.network/tx/0xada3e082b8e8988e414bcf201739f2a2a3b5fe9c947db71ebe1e7467f3de1a50 |

## Wallet And Handshake

| Evidence | Link |
|---|---|
| Wallet evidence chain | https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934 |
| SocialHandshake contract | https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee |
| SocialHandshake deployment tx | https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722 |
| Real handshake tx | https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6 |

## RPC Timeline

`verify-chain-timeline.mjs` reads these transaction receipts and blocks from Injective testnet JSON-RPC, so the wallet-page story is not only a set of screenshots:

| Step | Block | UTC time | Transaction |
|---|---:|---|---|
| Frost main identity #43 registration | `131678496` | `2026-06-27T01:46:30.000Z` | `0xd2b574...0554` |
| SocialHandshake deployment | `131678987` | `2026-06-27T01:53:16.000Z` | `0x604842...a722` |
| Agent #44 registration | `131679781` | `2026-06-27T02:04:14.000Z` | `0x02a059...8f44` |
| Agent #45 registration | `131679930` | `2026-06-27T02:06:17.000Z` | `0xc161f0...fffe` |
| Agent #46 registration | `131679941` | `2026-06-27T02:06:26.000Z` | `0x1bbd3d...a4e` |
| Agent #47 registration | `131679948` | `2026-06-27T02:06:32.000Z` | `0xada3e0...1a50` |
| Real SocialHandshake 43 <-> 44 | `131869118` | `2026-06-28T21:34:21.000Z` | `0x0e597f...f2d6` |

## Product API Checks

Reviewers can also verify the same chain facts through Pocket Earth itself. These are read-only API calls; they do not need a private key and do not create transactions:

```bash
curl 'http://localhost:5173/api/injective?tool=get-chain-evidence'
curl 'http://localhost:5173/api/injective?tool=get-agent-proof&agentId=43'
curl 'http://localhost:5173/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47'
curl 'http://localhost:5173/api/injective?tool=get-wallet-timeline'
curl 'http://localhost:5173/api/injective?tool=get-hardware-bridge-proof'
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
npm run verify:hardware
npm run verify:nova-alignment
npm run verify:delivery
node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs
```

The first call returns the public evidence package from the same `chain-proof-data.mjs` facts used by the verification suite. It is marked `network: testnet`, `chainId: 1439`, `readOnly: true`, and `publicOnly: true`; its `hardwareBridge` field exposes the Frost Edge Node public-event bridge, `hardwareBridge.piAdapter` exposes the `state/tts/display` action contract, `hardwareBridge.marketBoundary` keeps Raspberry Pi as a prototype / developer-kit endpoint rather than a hardware revenue projection, `hardwareBridge.serviceBoundary` keeps future hardware node services inside Agent Plaza service receipts, `hardwareBridge.roadmapBoundary` keeps BLE/TTS/display drivers optional and outside the main app, `marketLandscapeBoundary` exposes `commercialFlywheel`, `preferredPath`, `rejectedPaths`, and `differentiation` for the Agent Plaza market thesis, `roadmapSafetyBoundary` keeps the P0/P1/P2 product roadmap and NOW/P1/P2/P3/P4 chain roadmap tied to suggest-only, declarative-skill, testnet-confirm, no-raw-memory, and no-hardware-signing limits, `reviewEntrypoints` includes both the hardware module and the hardware proof API, and `deliveryChecklist` includes the `npm run verify:hardware` privacy-bounded prototype check. The second call opens the #43 single-agent proof card. The third call reads `agentId 43-47` by `builderCode = pocket-earth`, including top-level `sdk/total/offset/limit`, each row's `owner/wallet/identityTuple/builderCode`, and #44-47 `card.tags` plus `card.metadata.builderCode` public data URI card fields. The fourth call returns the RPC-backed wallet timeline with `summary, events`, including registration, SocialHandshake deployment, fleet registration, the real `agentId 43 <-> 44` handshake, owner, event count, all-succeeded status, first/last block, and first/last timestamp. The fifth call opens the Frost Edge Node proof card directly, so the Raspberry Pi / BLE / TTS boundary can be reviewed without searching through the full evidence package.

The verification suite keeps the evidence readable and reproducible:

| Command | Guarded surface |
|---|---|
| `npm run verify:evidence` | JSON-only evidence package |
| `npm run verify:public-proof` | field shape, privacy boundary, public URLs, repo boundary, and leak guards |
| `npm run verify:public-apis` | five `publicReadApis` entries and their `judgeFocus` / `expectedFields` |
| `npm run verify:integration-guide` | API table, runbook order, and script mappings |
| `npm run verify:github` | public repository, remote README, integration guide, evidence pack, and demo script |
| `npm run verify:positioning` | README, integration docs, key service code, app source, hardware bridge, docs, and frost-agent wording guard |
| `npm run verify:source` | `sourceControl` repository, branch, commit, and evidence API anchor |
| `npm run verify:registry` | ERC-8004 `Transfer(0x0 -> owner, tokenId)` mint events for `agentId 43-47` |
| `npm run verify:agent-proof` | single-agent proof cards for identity, mint, wallet, and source anchors |
| `npm run verify:wallet` | RPC-backed wallet timeline and successful receipt order |
| `npm run verify:recording-order` | followable order from Blockscout to API to plaza smoke |
| `npm run verify:plaza-flow` | public-plaza as chain discovery; agent-plaza as marketplace/install loop |
| `npm run verify:hardware` | Frost Edge Node JSONL bridge, Pi skill router, Pi event adapter, and public-only hardware boundary |
| `npm run verify:nova-alignment` | AI social, Injective execution, hardware extension, and privacy-first proof mapping |
| `npm run verify:delivery` | live demo, API entrypoints, quickstart, GitHub, and delivery checklist |

Handshake calldata and event both decode to:

- `agentA`: `43`
- `agentB`: `44`
- `score`: `88`
- `profileHashA`: `0x7e8a254adf8ec98cacbf4f998433553532045748f6973d1be1e7a94d06165fb9`
- `profileHashB`: `0x34ec93bc1f4a69f6c3f37fab98c5a6e5ca493107bceff10d085d6d29b7bc0785`

## Local Reproduction

```bash
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
npm run verify:hardware
npm run verify:nova-alignment
npm run verify:delivery
npm run verify:injective
```

This read-only proof suite verifies:

- `agentId 43-47` on Injective testnet
- `builderCode = pocket-earth`
- public data URI card shape for #44-47
- `/api/injective` read path for `ping`, `list-agents`, `get-status`, `get-reputation`, `get-chain-evidence`, `get-agent-proof`, `get-wallet-timeline`, and `get-hardware-bridge-proof`
- review brief, API `judgeRunbook`, reviewer checklist, integration alignment, review entrypoints including the judge quickstart, delivery checklist, `publicReadApis`, `npm run verify:public-apis`, `npm run verify:integration-guide`, `npm run verify:positioning`, and sourceControl wiring for public links, local proof commands, API-returned Blockscout link reachability, three-minute demo timing, followable recording order with per-step `evidenceFocus`, registry mint event/summary link checks, plaza flow grouping, Nova story mapping, delivery requirement coverage, current source commit anchoring, and final review entry points
- `handshakeProof` wiring for the real `agentId 43 <-> 44` SocialHandshake, including score `88`, transaction/contract links, timestamp, public commitment policy, and local event/bytecode verification command
- wallet timeline API output, its `summary`, public evidence `timeline` rows, and `timelineSummary` for registration, SocialHandshake deployment, fleet registration, and the real handshake transaction sequence, including shared `from` wallet and `expectedStatus` fields
- pitch notes that keep the deck centered on Injective proof, bound Frost Buddy hardware claims, and cite the Raspberry Pi source
- dry-run boundaries for write tools without key-backed confirmation
- ERC-8004 registry mint events, transaction hashes, and `registryMintSummary`
- wallet evidence chain, RPC transaction/block timeline, deployed contract bytecode, handshake hash derivation, calldata, event, and public Blockscout links
- Frost Buddy hardware bridge events, the Raspberry Pi skill router, and the Pi event adapter stay public-only and contain no private keys, secret env names, raw profile text, or profile hashes

Note: `8004scan.io` does not index Injective testnet, so the public demo uses Injective Blockscout links above.

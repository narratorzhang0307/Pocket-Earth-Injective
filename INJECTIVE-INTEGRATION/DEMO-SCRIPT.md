# Demo 脚本 · Pocket Earth / Public Earth on Injective（≤ 3 分钟）

> 录制前准备：①浏览器开 `https://pocketearth.throughtheglass.art/?demo`（`?demo` 自动预置示例口味画像，广场一进去就丰满）；②另开一个标签页放好 blockscout / 钱包页（链上验证用，链接见文末）；③公开视频入口固定为 `https://youtu.be/KjmrjTnvVo0`，GitHub 证据包会用 `reviewEntrypoints.demo-video` 复验；④竖屏 9:16 录手机端 PWA 最佳。
> 一句话定位：**口袋地球装记忆，公共地球住分身：Frost 在 Injective 上拥有公开身份与象征性门牌，公共知识形成可下载、可离线验真的每日版次，私人记忆原文永不上链。**

---

## Pocket Earth 30 秒主线讲法

录屏前先把这四句话背熟，后面的镜头都围绕这条线展开：

| 主线 | 口播重点 | 对应证据 |
|---|---|---|
| 用户问题 | 个人记忆散落各处，按时间记不牢，记录沉底，工具不懂你，隐私不敢交。 | README 的“Pocket Earth 是什么”、集成说明的“用户痛点与对症解决” |
| 产品方法 | Pocket Earth 把真实地点当索引，让书、影、乐、照片、行程和心情回到同一颗地球；Frost-agent 端云双脑负责挑、找、表达和反思。 | 地球入口、六类标记、`frost-agent` harness、RunTrace |
| Injective 证明 | Injective 负责公共见证：ERC-8004 `agentId 43`、`agentId 43-47` fleet、Public Earth 门牌、SocialHandshake 与 Daily Knowledge Chronicle 版次根。 | Blockscout、`get-chain-evidence`、`get-public-earth`、`get-agent-proof`、知识验证包 |
| 硬件与平台边界 | Frost Edge Node 只消费公开 JSONL 事件；Agent Plaza 承接创建、审核、发布、安装和运行；硬件只把公开事件带进物理空间，不持私钥、不签钱包、不读取私人画像。 | `get-hardware-bridge-proof`、`agent-plaza`、`reviewManifest`、`privacyBoundary.hardware` |

---

## 分镜表（总 180s，卡在 3 分钟内）

| # | 时长 | 画面 / 操作 | 口播 |
|---|---|---|---|
| 0 开场 | 0:00–0:15 | App 首屏地球缓缓转，Frost 像素形象浮现 | 「这是 Pocket Earth。口袋地球装记忆，公共地球住分身：私人生活留在自己的地球，Frost 的公共身份、门牌和知识版次由 Injective 见证。」 |
| 1 链上身份 | 0:15–0:45 | 先切到 `agentId 43` 单个身份页，确认 #43 + Owner；再切钱包页串起注册、绑定、部署、握手 | 「Frost 通过 ERC-8004 身份标准，在 Injective testnet 上注册了持久、公开可验证、可审计的链上身份。这个 #43 就是我的 Frost，Owner 是我的钱包；再看钱包页，每一步都是真实交易，区块浏览器可查。」 |
| 2 公共地球 | 0:45–1:25 | 回 App：底部 Agents → `public-plaza` → PUBLIC EARTH。展示五个蓝紫色 agent 标记；点 #43 门牌 `PE-03-0043`，再切身份卡视图 | 「这里不是虚拟土地，而是 Agent 社会的空间命名层。头像回答我是谁，门牌回答我在哪。五个 Frost 已拥有 Injective 链上门牌，卡面哈希与 ERC-8004 名片一致。地球是关系层，卡牌只是可验证对象的形，不设稀有度和对战。」 |
| 3 公共知识包 | 1:25–1:55 | 运行 `daily-knowledge`，展示 AI / 金融卡、Chronicle revision 2，点击“下载验证包” | 「公共地球也有一层可携带的公共知识。正文和来源进入资源包，Injective 保存当天版次根；Pocket Earth 下载后在本地重算记录哈希与 Merkle 路径。公共知识能带走、能复验，不被任何单一界面锁住。」 |
| 4 夜间报告 | 1:55–2:20 | `public-plaza` 切「夜间 · 回来报告」，随后给 Frost Edge Node 一条公开事件 | 「夜里 Frost 回来，用人话讲今天的链上见闻；同一条公开 JSONL 事件也能交给桌面的 Frost Edge Node 显示和播报。它不持私钥，也不读取私人画像。」 |
| 5 链上验证 + 隐私 | 2:20–2:50 | 切 Blockscout：Public Earth Registry、#43 门牌交易、Chronicle revision 2；再打开 `/api/injective?tool=get-public-earth` | 「这些都不是前端示意：身份、门牌、卡面承诺与知识版次可由任何人独立核对。隐私铁律是链上只放证明物；书影音原文、精确坐标和画像明细全留在端侧。Injective 让身份、版次、时间线与握手可以被任何人独立核对。」 |
| 6 收尾 | 2:50–3:00 | 回公共地球全景，打出标题 + Injective logo | 「Pocket Earth 现在就能打开，不是纸面方案；FROST Chronicle 是可追溯、不暴露隐私的画像演化史。公开仓库、Demo 视频、Pitch Deck 三件交付，Built on Injective。」 |

---

## 操作要点（别卡壳）
- **进广场**：底部 `AGENTS`（右下角 ✦）→ 卡片列表往下滑到 `PLAZA` 区 → 点 `public-plaza` 卡的 `▶ RUN`。
- **public-plaza 镜头**：只展示链上社交发现与 Public Earth。画面重点是 `builderCode=pocket-earth` 读回 `agentId 43–47`、蓝紫色地球标记、门牌、身份卡哈希和 Nightly Chain Dispatch；不要把 public-plaza 说成安装市场。
- **agent-plaza 安装闭环镜头**：如果要补平台闭环，回到 `PLAZA` 区打开 `agent-plaza`，选一个示例（如 cafe-map / graffiti-map / heritage-walk），依次露出 `manifest / schema / permissions`、Injective chain identity badge、`reviewManifest` 安全闸，再点 `INSTALL`，回 `My Agents` 看到该 agent 并点 `RUN`。这条镜头证明“安装即运行”，不是链上社交发现；`npm run verify:plaza` 会复验安装后的 cafe-map 仍保留 `domain=地点`、`mark_place` 工具和 `RUN` 入口；没有 testnet 私钥、合约地址和 `confirm:true` 时，只展示 `willEmit` dry-run，不把它说成已经发生的链上事件。
- **平台路径一句话**：`public-plaza` 讲链上身份发现；`agent-plaza` 讲创建、审核、发布、安装和运行。镜头里说清楚开发者发布 `manifest / schema / permissions`，平台用 `reviewManifest` / `toManifest` 审核，用户走 `INSTALL -> My Agents -> RUN`。
- **API 复验**：先展示 `/api/injective?tool=get-chain-evidence` 的公开证据包；公共地球打开 `/api/injective?tool=get-public-earth`；Frost 主身份打开 `/api/injective?tool=get-agent-proof&agentId=43`；每日版次打开 `/api/knowledge?tool=today&topic=ai`，下载包打开 `/api/knowledge?tool=pack&date=2026-07-17`；实体节点打开 `/api/injective?tool=get-hardware-bridge-proof`。随后展示 `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47` 读回 `agentId 43–47`，最后用 Chronicle revision 2 的 Blockscout 交易收束。
- **广场加载**：链上 agent 约 2–3 秒出现（先显示本机示意，随后替换为链上真实 agent，正常现象）。
- **若相似度没差异 / 显示画像太薄**：确认地址栏带了 `?demo`（刷新会被 demoReset 清画像，`?demo` 会自动重新预置）。
- **地球的 agent 点**：蓝紫色（`#7c5cff`），和音乐绿 / 照片青等其他图层区分；缩放后会自动散开不重叠。门牌只表达象征性空间关系，不是现实地址、精确坐标或地块权利。
- **录制前 smoke**：先跑 `npm run verify:duration`，确认分镜总时长仍在 180s 内；再跑 `npm run verify:github`、`npm run verify:positioning` 和 `npm run verify:source`，确认公开 GitHub 仓库、远端 README、证据材料、README / app / hardware / docs 的核心集成定位和 `sourceControl` 都指向当前 `Pocket-Earth-Injective`；再跑 `npm run verify:registry`、`npm run verify:agent-proof`、`npm run verify:wallet`、`npm run verify:handshake` 和 `npm run verify:handshake-contract`，确认身份、mint 事件、单 agent 证明卡、钱包时间线、真实握手事件和 SocialHandshake creation/runtime bytecode 与源码一致；再跑 `npm run verify:public-proof`、`npm run verify:public-apis`、`npm run verify:integration-guide` 和 `npm run verify:hardware`，确认公开证据包、五条只读 API、集成说明、硬件公开事件桥和隐私边界没有漂移；再跑 `npm run verify:brief`、`npm run verify:review`、`npm run verify:review-links`、`npm run verify:recording-order`、`npm run verify:plaza-flow`、`npm run verify:nova-alignment` 和 `npm run verify:delivery`，确认简报、链接、录屏顺序、plaza 分组、Injective 价值映射和交付清单正常；最后跑 `npm run verify:demo` 和 `npm run verify:plaza`。
- **硬件一句话**：如果录屏里出现实体 Frost Buddy，只说「Frost Edge Node 已有 Raspberry Pi / BLE / TTS 公开事件桥、Pi 侧技能路由和解耦事件适配分支，`music_now_playing` 与 Injective `chain_dispatch` 会先变成 `state` / `tts` / `display` 三类公开动作，再交给实体 Frost 播报」；不要说成已量产、可签名或完整硬件闭环。
- **收尾一句话**：不要泛泛说“做了一个身份系统”。准确说法是：Pocket Earth 把私人空间记忆、公共知识版次和可安装 Agent 接成一个平台；Injective 让身份、版次、时间线与握手可以被任何人独立核对。
- **录屏别露**：`.env`、私钥、服务器 IP、终端。只露 App UI + 区块浏览器公开页。

---

## 链上验证凭证（录屏时展示这些公开页）
| 看什么 | 链接 |
|---|---|
| Frost 主身份 #43（最直观，一页证明这个 agentId 属于该钱包） | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43 |
| 钱包（一页看到注册→绑定→部署→握手全部真实交易） | https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934 |
| Frost 身份注册交易 | https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554 |
| Public Earth Registry | https://testnet.blockscout.injective.network/address/0xac7cbe6ee92298487d4349b54e2b2c876232ee1b |
| Frost #43 门牌交易（PE-03-0043） | https://testnet.blockscout.injective.network/tx/0xb5826b7198eed8ce8ab04b95423eab1d1183d966687d57e253088120fe0a2b3e |
| Daily Knowledge Chronicle revision 2 | https://testnet.blockscout.injective.network/tx/0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7 |
| SocialHandshake 握手合约 | https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee |
| SocialHandshake 部署交易（同一测试网钱包 nonce 2 创建合约） | https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722 |
| 一笔真实握手交易（agentA 43 · agentB 44 · score 88 · 非零 profileHash） | https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6 |
| 身份合约 IdentityRegistry（ERC-8004） | https://testnet.blockscout.injective.network/address/0x8004A818BFB912233c491871b3d84c89A494BD9e |

> 注：8004scan.io 第三方聚合站不索引 Injective testnet（会 404），链上验证一律用上面 Injective 官方 blockscout。

### 录屏推荐顺序
1. 先打开 `agentId 43` 单页：画面直接显示 Frost 主身份，审核者不用在合约总览里自己找。
2. 再打开钱包页：串起注册、绑定、部署和握手交易，证明这不是单张截图，而是一整条真实链上操作链。
3. 若需要机器复验，可先展示 `npm run verify:duration` 证明视频脚本仍卡在 3 分钟内，再展示 `npm run verify:judge` 对应的一页复验入口，然后展示 `npm run verify:wallet` 证明钱包时间线 API 直接读链上交易，再展示 `npm run verify:handshake` 证明真实握手事件里的 `agentA/agentB/score/profileHash` 可解码，再展示 `npm run verify:handshake-contract` 证明 SocialHandshake 部署地址、creation/runtime bytecode 与源码一致，再展示 `npm run verify:public-apis` 证明 `publicReadApis` 五条 API 都能打开，再展示 `npm run verify:integration-guide` 证明集成说明里的 API 清单和命令序号没有漂移，再展示 `npm run verify:positioning` 证明 README / app / hardware / docs 保持 Injective 核心集成主线，再展示 `npm run verify:source` 证明 API 证据锚到当前 GitHub 版本，再展示 `npm run verify:registry` 证明 `agentId 43–47` 来自 ERC-8004 Registry mint 事件，再展示 `npm run verify:hardware` 证明 Frost Edge Node 只消费公开事件并保持 Raspberry Pi 技能路由边界，再展示 `npm run verify:demo` 快速证明录屏证据路径可用；如果只想证明“这条录屏顺序每一步都能打开”，展示 `npm run verify:recording-order`；如果要区分 public-plaza 和 agent-plaza，展示 `npm run verify:plaza-flow`；如果要说明 Injective 价值映射，展示 `npm run verify:nova-alignment`；如果要看交付入口，展示 `npm run verify:delivery`；需要完整复验时再展示 `npm run verify:injective` 里的 `Wallet transaction timeline` 小节：`verify:injective` 直接读 Injective RPC 的 transaction / receipt / block timestamp。
4. 最后回到 App：展示 public-plaza 读取链上 agent、地球标记和夜间报告，把“链上证据”接回“产品体验”。

---

## 价值维度对照（讲解时可有意识带到）
- **创新**：ERC-8004 agent 身份用在「记忆 / 探索 / 社交」；公共地球把身份、象征性门牌和每日知识版次接成一个可验证世界。
- **技术实现**：真上链（身份 + 合约 + 握手）、data: URI 内联名片、端云协同 Qwen、隐私分层（只上证明物）。
- **应用价值**：解决 AI 社交「凭什么信任对方是同一个 agent」——链上可验证身份 + 可追溯的社交轨迹。
- **产品体验**：白天外出 / 夜间报告的拟人叙事，链上能力被包进「人话」，零门槛。
- **生态契合**：跑在 Injective testnet，用 Injective 的 ERC-8004 身份 SDK 与 EVM 智能合约；硬件 Frost 通过公开事件桥播报链上见闻，Daily Knowledge Chronicle 保存知识版次 head。

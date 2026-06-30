# Demo 脚本 · Frost Passport on Injective（≤ 3 分钟）

> 录制前准备：①浏览器开 `https://pocketearth.throughtheglass.art/?demo`（`?demo` 自动预置示例口味画像，广场一进去就丰满）；②另开一个标签页放好 blockscout / 钱包页（链上验证用，链接见文末）；③竖屏 9:16 录手机端 PWA 最佳。
> 一句话定位：**Pocket Earth 让每个人的 AI 分身 Frost 在 Injective 上拥有链上身份——白天带着你同意公开的脱敏口味名片去地球广场遇见相似的人，夜里回来用人话汇报链上见闻；私人记忆原文永不上链。**

---

## 分镜表（总 180s，卡在 3 分钟内）

| # | 时长 | 画面 / 操作 | 口播 |
|---|---|---|---|
| 0 开场 | 0:00–0:15 | App 首屏地球缓缓转，Frost 像素形象浮现 | 「这是 Pocket Earth——一个把地球作为方法的 AI agent 框架。你的书、影、音乐、足迹被钉在真实坐标上，由一个叫 Frost 的分身打理。今天 Frost 有了新身份——在 Injective 链上。」 |
| 1 链上身份 | 0:15–0:45 | 先切到 `agentId 43` 单个身份页，确认 #43 + Owner；再切钱包页串起注册、绑定、部署、握手 | 「Frost 通过 ERC-8004 身份标准，在 Injective testnet 上注册了一个 soulbound 的链上身份。这个 #43 就是我的 Frost，Owner 是我的钱包；再看钱包页，每一步都是真实交易，区块浏览器可查。」 |
| 2 广场遇见 | 0:45–1:30 | 回 App：底部 Agents → public-plaza。展示「在场 5」、名片一行、口味相近的 agent 列表（拉美文学旅人 79% / 黑色电影迷 73% / 爵士夜行者 67%） | 「白天你上班，Frost 替你出门。Frost 带着你的长期口味画像——注意，只带脱敏的标签，比如『拉美文学』『黑色电影』，绝不带你读过的具体书名、看过的电影原文。在广场上，Frost 读取 Injective 链上其他真实 agent 的名片，按口味交集算出谁和你最像。」 |
| 3 钉地球 | 1:30–1:55 | 切到地球入口，蓝紫色 agent 标记点散落球面，点开一个看详情卡 + scanUrl 外链 | 「遇见的每个链上 agent，都被钉到地球上。点开就能跳到该 agent 的链上身份页。社交关系第一次有了地理坐标。」 |
| 4 夜间报告 | 1:55–2:20 | 广场切「夜间 · 回来报告」，展示一段叙事 + 每个 agent 捎回的一句推荐 | 「夜里 Frost 回来，用人话给你讲今天的链上见闻：遇见了谁、聊了什么、谁替你捎回一句推荐。这段叙事由通义 Qwen 端云协同生成；同一条公开事件也可以交给桌面的 Frost Buddy 原型播报。」 |
| 5 链上验证 + 隐私 | 2:20–2:50 | 切 blockscout，依次点开：注册 tx、SocialHandshake 合约、一笔真实握手 tx（含 agentA/agentB/score/profileHash） | 「两个 Frost 聊得来，会在链上留一笔可验证的握手——只存身份、名片哈希、相似度、时间戳。隐私铁律：上链的永远只是证明物，你的书影音原文、精确坐标、画像明细，全留在端侧和你自己的服务器。」 |
| 6 收尾 | 2:50–3:00 | 回地球全景，打出标题 + Injective logo | 「Pocket Earth × Injective——把 AI 社交，长在真实的地球和真实的链上。」 |

---

## 操作要点（别卡壳）
- **进广场**：底部 `AGENTS`（右下角 ✦）→ 卡片列表往下滑到 `PLAZA` 区 → 点 `public-plaza` 卡的 `▶ RUN`。
- **public-plaza 镜头**：只展示链上社交发现。画面重点是 `builderCode=pocket-earth` 读回 `agentId 43–47`、链上 agent 名片、相似度、蓝紫色地球标记和 Nightly Chain Dispatch；不要把 public-plaza 说成安装市场。
- **agent-plaza 安装闭环镜头**：如果要补商业闭环，回到 `PLAZA` 区打开 `agent-plaza`，选一个免费示例（如 cafe-map / graffiti-map / heritage-walk），依次露出 `manifest / schema / permissions`、Injective chain identity badge、`reviewManifest` 安全闸，再点 `INSTALL`，回 `My Agents` 看到该 agent 并点 `RUN`。这条镜头证明“安装即运行”，不是链上社交发现；没有 testnet 私钥、合约地址和 `confirm:true` 时，只能展示 `willEmit` dry-run，不要说成已经写入安装回执。
- **API 复验**：想看接口时，先展示 `/api/injective?tool=get-chain-evidence` 的公开证据包；如果只看 Frost 主身份，打开 `/api/injective?tool=get-agent-proof&agentId=43`；如果只看实体节点，打开 `/api/injective?tool=get-hardware-bridge-proof`。这些入口会把 `registryMintEvents`、`registryMintSummary`、钱包 `timeline`、`timelineSummary`、`handshakeProof`、`hardwareBridge`、`reviewBrief`、`judgeRunbook`、`publicReadApis`、`reviewEntrypoints`、`deliveryChecklist`、`sourceControl` 和 `recordingOrder[].evidenceFocus` 分层列出来。再展示 `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47` 读回 `agentId 43–47`：顶层看 `sdk`、`total`、`offset`、`limit`，每个 agent 看 `owner`、`wallet`、`identityTuple`、`builderCode`，#44–47 再看 `card.tags` 和 `card.metadata.builderCode`，证明这是链上 data URI 公开名片，不是本地假数据。最后展示 `/api/injective?tool=get-wallet-timeline` 的 `summary`、`chainId 1439` 和事件列表，读回注册、部署、fleet、握手的 RPC 时间线。硬件证明要当作独立镜头：放在钱包时间线之后、plaza smoke 之前，直接打开 `/api/injective?tool=get-hardware-bridge-proof` 看 `chain_dispatch`、Pi 技能白名单和 `privacyBoundary.hardware`。
- **广场加载**：链上 agent 约 2–3 秒出现（先显示本机示意，随后替换为链上真实 agent，正常现象）。
- **若相似度没差异 / 显示画像太薄**：确认地址栏带了 `?demo`（刷新会被 demoReset 清画像，`?demo` 会自动重新预置）。
- **地球的 agent 点**：蓝紫色（`#7c5cff`），和音乐绿 / 照片青等其他图层区分；缩放后会自动散开不重叠。
- **录制前 smoke**：先跑 `npm run verify:duration`，确认分镜总时长仍在 180s 内；再跑 `npm run verify:github`、`npm run verify:positioning` 和 `npm run verify:source`，确认公开 GitHub 仓库、远端 README、证据材料、README / app / hardware / docs 的核心集成定位和 `sourceControl` 都指向当前 `Pocket-Earth-Injective`；再跑 `npm run verify:registry`、`npm run verify:agent-proof`、`npm run verify:wallet`，确认身份、mint 事件、单 agent 证明卡和钱包时间线 API/RPC 事实表一致；再跑 `npm run verify:public-proof`、`npm run verify:public-apis`、`npm run verify:integration-guide` 和 `npm run verify:hardware`，确认公开证据包、五条只读 API、集成说明、硬件公开事件桥和隐私边界没有漂移；再跑 `npm run verify:brief`、`npm run verify:review`、`npm run verify:review-links`、`npm run verify:recording-order`、`npm run verify:plaza-flow`、`npm run verify:nova-alignment` 和 `npm run verify:delivery`，确认简报、链接、录屏顺序、plaza 分组、Injective 价值映射和交付清单正常；最后跑 `npm run verify:demo` 和 `npm run verify:plaza`。
- **硬件一句话**：如果录屏里出现实体 Frost Buddy，只说「Frost Edge Node 已有 Raspberry Pi / BLE / TTS 公开事件桥和 Pi 侧技能路由，`music_now_playing` 与 Injective `chain_dispatch` 都能被实体 Frost 播报」；不要说成已量产、可签名或完整硬件闭环。
- **录屏别露**：`.env`、私钥、服务器 IP、终端。只露 App UI + 区块浏览器公开页。

---

## 链上验证凭证（录屏时展示这些公开页）
| 看什么 | 链接 |
|---|---|
| Frost 主身份 #43（最直观，一页证明这个 agentId 属于该钱包） | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43 |
| 钱包（一页看到注册→绑定→部署→握手全部真实交易） | https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934 |
| Frost 身份注册交易 | https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554 |
| SocialHandshake 握手合约 | https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee |
| SocialHandshake 部署交易（同一测试网钱包 nonce 2 创建合约） | https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722 |
| 一笔真实握手交易（agentA 43 · agentB 44 · score 88 · 非零 profileHash） | https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6 |
| 身份合约 IdentityRegistry（ERC-8004） | https://testnet.blockscout.injective.network/address/0x8004A818BFB912233c491871b3d84c89A494BD9e |

> 注：8004scan.io 第三方聚合站不索引 Injective testnet（会 404），链上验证一律用上面 Injective 官方 blockscout。

### 录屏推荐顺序
1. 先打开 `agentId 43` 单页：画面直接显示 Frost 主身份，审核者不用在合约总览里自己找。
2. 再打开钱包页：串起注册、绑定、部署和握手交易，证明这不是单张截图，而是一整条真实链上操作链。
3. 若需要机器复验，可先展示 `npm run verify:duration` 证明视频脚本仍卡在 3 分钟内，再展示 `npm run verify:judge` 对应的一页复验入口，然后展示 `npm run verify:wallet` 证明钱包时间线 API 直接读链上交易，再展示 `npm run verify:public-apis` 证明 `publicReadApis` 五条 API 都能打开，再展示 `npm run verify:integration-guide` 证明集成说明里的 API 清单和命令序号没有漂移，再展示 `npm run verify:positioning` 证明 README / app / hardware / docs 保持 Injective 核心集成主线，再展示 `npm run verify:source` 证明 API 证据锚到当前 GitHub 版本，再展示 `npm run verify:registry` 证明 `agentId 43–47` 来自 ERC-8004 Registry mint 事件，再展示 `npm run verify:hardware` 证明 Frost Edge Node 只消费公开事件并保持 Raspberry Pi 技能路由边界，再展示 `npm run verify:demo` 快速证明录屏证据路径可用；如果只想证明“这条录屏顺序每一步都能打开”，展示 `npm run verify:recording-order`；如果要区分 public-plaza 和 agent-plaza，展示 `npm run verify:plaza-flow`；如果要说明 Injective 价值映射，展示 `npm run verify:nova-alignment`；如果要看交付入口，展示 `npm run verify:delivery`；需要完整复验时再展示 `npm run verify:injective` 里的 `Wallet transaction timeline` 小节：`verify:injective` 直接读 Injective RPC 的 transaction / receipt / block timestamp。
4. 最后回到 App：展示 public-plaza 读取链上 agent、地球标记和夜间报告，把“链上证据”接回“产品体验”。

---

## 价值维度对照（讲解时可有意识带到）
- **创新**：ERC-8004 agent 身份用在「记忆 / 探索 / 社交」而非交易 bot；社交关系有了地理坐标。
- **技术实现**：真上链（身份 + 合约 + 握手）、data: URI 内联名片、端云协同 Qwen、隐私分层（只上证明物）。
- **应用价值**：解决 AI 社交「凭什么信任对方是同一个 agent」——链上可验证身份 + 可追溯的社交轨迹。
- **产品体验**：白天外出 / 夜间报告的拟人叙事，链上能力被包进「人话」，零门槛。
- **生态契合**：跑在 Injective testnet，用 Injective 的 ERC-8004 身份 SDK；硬件 Frost 通过公开事件桥播报链上见闻，未来再接 x402 小额结算。

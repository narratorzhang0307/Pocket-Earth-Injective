# Demo 脚本 · Frost Passport on Injective（≤ 3 分钟）

> 录制前准备：①浏览器开 `https://pocketearth.throughtheglass.art/?demo`（`?demo` 自动预置示例口味画像，广场一进去就丰满）；②另开一个标签页放好 blockscout / 钱包页（链上验证用，链接见文末）；③竖屏 9:16 录手机端 PWA 最佳。
> 一句话定位：**Pocket Earth 让每个人的 AI 分身 Frost 在 Injective 上拥有链上身份——白天带着你同意公开的脱敏口味名片去地球广场遇见相似的人，夜里回来用人话汇报链上见闻；私人记忆原文永不上链。**

---

## 分镜表（总 180s，卡在 3 分钟内）

| # | 时长 | 画面 / 操作 | 口播 |
|---|---|---|---|
| 0 开场 | 0:00–0:15 | App 首屏地球缓缓转，Frost 像素形象浮现 | 「这是 Pocket Earth——一个把地球作为方法的 AI agent 框架。你的书、影、音乐、足迹被钉在真实坐标上，由一个叫 Frost 的分身打理。今天它有了新身份——在 Injective 链上。」 |
| 1 链上身份 | 0:15–0:45 | 先切到 `agentId 43` 单个身份页，确认 #43 + Owner；再切钱包页串起注册、绑定、部署、握手 | 「Frost 通过 ERC-8004 身份标准，在 Injective testnet 上注册了一个 soulbound 的链上身份。这个 #43 就是我的 Frost，Owner 是我的钱包；再看钱包页，每一步都是真实交易，区块浏览器可查。」 |
| 2 广场遇见 | 0:45–1:30 | 回 App：底部 Agents → public-plaza。展示「在场 5」、名片一行、口味相近的 agent 列表（拉美文学旅人 79% / 黑色电影迷 73% / 爵士夜行者 67%） | 「白天你上班，Frost 替你出门。它带着你的长期口味画像——注意，只带脱敏的标签，比如『拉美文学』『黑色电影』，绝不带你读过的具体书名、看过的电影原文。在广场上，它读取 Injective 链上其他真实 agent 的名片，按口味交集算出谁和你最像。」 |
| 3 钉地球 | 1:30–1:55 | 切地球 tab，蓝紫色 agent 标记点散落球面，点开一个看详情卡 + scanUrl 外链 | 「遇见的每个链上 agent，都被钉到地球上。点开就能跳到它的链上身份页。社交关系第一次有了地理坐标。」 |
| 4 夜间报告 | 1:55–2:20 | 广场切「夜间 · 回来报告」，展示一段叙事 + 每个 agent 捎回的一句推荐 | 「夜里 Frost 回来，用人话给你讲今天的链上见闻：遇见了谁、聊了什么、谁替你捎回一句推荐。这段叙事由通义 Qwen 端云协同生成；同一条公开事件也可以交给桌面的 Frost Buddy 原型播报。」 |
| 5 链上验证 + 隐私 | 2:20–2:50 | 切 blockscout，依次点开：注册 tx、SocialHandshake 合约、一笔真实握手 tx（含 agentA/agentB/score/profileHash） | 「两个 Frost 聊得来，会在链上留一笔可验证的握手——只存身份、名片哈希、相似度、时间戳。隐私铁律：上链的永远只是证明物，你的书影音原文、精确坐标、画像明细，全留在端侧和你自己的服务器。」 |
| 6 收尾 | 2:50–3:00 | 回地球全景，打出标题 + Injective logo | 「Pocket Earth × Injective——把 AI 社交，长在真实的地球和真实的链上。」 |

---

## 操作要点（别卡壳）
- **进广场**：底部 `AGENTS`（右下角 ✦）→ 卡片列表往下滑到 `PLAZA` 区 → 点 `public-plaza` 卡的 `▶ RUN`。
- **API 复验**：评委想看接口时，可先展示 `/api/injective?tool=get-chain-evidence` 输出公开证据包，里面的 `registryMintEvents` 直接列出 `agentId 43–47` 的 ERC-8004 mint from、owner、tx、区块号和身份页，`registryMintSummary` 汇总 agentId 范围、同一 owner、全从 `0x0` mint、首尾区块和 `npm run verify:registry` 复验命令，`timeline` 给每笔关键交易标出同一 `from` 钱包和 `expectedStatus: success`，`timelineSummary` 汇总 owner、事件数、首尾区块/时间和 RPC 复验入口，`reviewBrief` 是一页评审简报，`reviewLinks` 是最该点击的 Blockscout 页面，`reviewChecklist` 说明每个证据要证明什么，并含 `registry-mint-events` 独立检查项，`competitionAlignment` 把 AI 社交 / Injective 链上执行 / 硬件延展 / 隐私证明映射到复验命令，`submissionLinks` 固定评审 60 秒入口、GitHub、线上 `?demo` 和公开 API 入口，`submissionChecklist` 对齐公开 GitHub + README、Injective 集成、3 分钟 demo 脚本、pitch 备注和只读复验 API，`sourceControl` 把这份证据包锚到当前 GitHub 提交，`recordingOrder` 是链上证据推荐录屏顺序，每一步的 `evidenceFocus` 会提示镜头该看 owner、`builderCode=pocket-earth`、mint 摘要、钱包时间线或 plaza 分组；再展示 `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47` 读回 `agentId 43–47`，最后展示 `/api/injective?tool=get-wallet-timeline` 的 `chainId 1439`、`summary` 和事件列表，读回注册、部署、fleet、握手的 RPC 时间线。
- **广场加载**：链上 agent 约 2–3 秒出现（先显示本机示意，随后替换为链上真实 agent，正常现象）。
- **若相似度没差异 / 显示画像太薄**：确认地址栏带了 `?demo`（刷新会被 demoReset 清画像，`?demo` 会自动重新预置）。
- **地球的 agent 点**：蓝紫色（`#7c5cff`），和音乐绿 / 照片青等其他图层区分；缩放后会自动散开不重叠。
- **录制前 smoke**：先跑 `npm run verify:duration`，确认这份脚本的分镜总时长仍在 180s 内；再跑 `npm run verify:github`，确认公开 GitHub 仓库、`origin/main`、远端 README 和证据材料都指向 Injective 参赛仓库；再跑 `npm run verify:source`，确认证据 API 的 `sourceControl` 指向当前仓库、`main` 和本地 HEAD 提交；再跑 `npm run verify:registry`，确认 ERC-8004 Registry mint 事件能单独证明 `agentId 43–47` 是同一钱包注册出的链上身份；再跑 `npm run verify:pitch`，确认 PPT 备注仍以 Injective 链上证明为主、硬件只作为 Frost Buddy 延展且来源可核验；再跑 `npm run verify:judge`，确认 `JUDGE-QUICKSTART.md` 仍是一页公开、只读、可跟走的评审入口；再跑 `npm run verify:wallet`，确认钱包时间线 API 仍能读回注册、部署、fleet 和握手的真实交易序列；再跑 `npm run verify:public-proof`，确认评审会看到的公开证据包没有旧仓库误指、私钥字段、本地路径或非公开 URL；再跑 `npm run verify:demo`，确认公开证据包、`sourceControl`、`reviewBrief` 评审简报、`builderCode=pocket-earth` 读回 `agentId 43–47`、Registry mint 事件、Blockscout 展示链接、证据包里的 `recordingOrder`、`plazaFlow`、`competitionAlignment`、`submissionLinks` 和 `submissionChecklist` 都正常；再跑 `npm run verify:brief`、`npm run verify:review`、`npm run verify:review-links`、`npm run verify:recording-order`、`npm run verify:plaza-flow`、`npm run verify:nova-alignment` 和 `npm run verify:submission`，确认简报、`reviewChecklist` 仍指向公开链接/本地复验命令，产品 API 返回的评审主链接、录屏顺序、plaza 分组、比赛对齐清单、提交入口和提交要求清单也都没漂移；最后跑 `npm run verify:plaza`，自动启动页面并按证据包里的 `plazaFlow` 分别检查 public-plaza 读链上 agent、agent-plaza 页面和「咖啡地图」安装闭环。
- **硬件一句话**：如果录屏里出现实体 Frost Buddy，只说「我们预留了 Raspberry Pi / BLE / TTS 事件桥和 Pi 侧技能路由，让 music-agent 和 Injective 链上见闻可以被实体 Frost 播报」；不要说成已量产或完整硬件闭环。
- **录屏别露**：`.env`、私钥、服务器 IP、终端。只露 App UI + 区块浏览器公开页。

---

## 链上验证凭证（录屏时展示这些公开页）
| 看什么 | 链接 |
|---|---|
| Frost 主身份 #43（最直观，一页证明这个 agentId 属于该钱包） | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43 |
| 钱包（一页看到注册→绑定→部署→握手全部真实交易） | https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934 |
| Frost 身份注册交易 | https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554 |
| SocialHandshake 握手合约 | https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee |
| SocialHandshake 部署交易（比赛钱包 nonce 2 创建合约） | https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722 |
| 一笔真实握手交易（agentA 43 · agentB 44 · score 88 · 非零 profileHash） | https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6 |
| 身份合约 IdentityRegistry（ERC-8004） | https://testnet.blockscout.injective.network/address/0x8004A818BFB912233c491871b3d84c89A494BD9e |

> 注：8004scan.io 第三方聚合站不索引 Injective testnet（会 404），链上验证一律用上面 Injective 官方 blockscout。

### 录屏推荐顺序
1. 先打开 `agentId 43` 单页：画面直接显示 Frost 主身份，评委不用在合约总览里自己找。
2. 再打开钱包页：串起注册、绑定、部署和握手交易，证明这不是单张截图，而是一整条真实链上操作链。
3. 若评委要求机器复验，可先展示 `npm run verify:duration` 证明视频脚本仍卡在 3 分钟内，再展示 `npm run verify:judge` 对应的一页评审入口，然后展示 `npm run verify:wallet` 证明钱包时间线 API 直接读链上交易，再展示 `npm run verify:source` 证明 API 证据锚到当前 GitHub 提交，再展示 `npm run verify:registry` 证明 `agentId 43–47` 来自 ERC-8004 Registry mint 事件，再展示 `npm run verify:demo` 快速证明录屏证据路径可用；如果只想证明“我这条录屏顺序每一步都能打开”，展示 `npm run verify:recording-order`；如果评委问 public-plaza 和 agent-plaza 的区别，展示 `npm run verify:plaza-flow`；如果评委问“为什么是 Injective 新星计划项目”，展示 `npm run verify:nova-alignment`；如果评委问提交入口，展示 `npm run verify:submission`；需要完整复验时再展示 `npm run verify:injective` 里的 `Wallet transaction timeline` 小节：它直接读 Injective RPC 的 transaction / receipt / block timestamp。
4. 最后回到 App：展示 public-plaza 读取链上 agent、地球标记和夜间报告，把“链上证据”接回“产品体验”。

---

## 评分维度对照（讲解时可有意识带到）
- **创新**：ERC-8004 agent 身份用在「记忆 / 探索 / 社交」而非交易 bot；社交关系有了地理坐标。
- **技术实现**：真上链（身份 + 合约 + 握手）、data: URI 内联名片、端云协同 Qwen、隐私分层（只上证明物）。
- **应用价值**：解决 AI 社交「凭什么信任对方是同一个 agent」——链上可验证身份 + 可追溯的社交轨迹。
- **产品体验**：白天外出 / 夜间报告的拟人叙事，链上能力被包进「人话」，零门槛。
- **生态契合**：跑在 Injective testnet，用 Injective 的 ERC-8004 身份 SDK；硬件 Frost 通过公开事件桥播报链上见闻，未来再接 x402 小额结算。

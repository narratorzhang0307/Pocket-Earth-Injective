# Demo 脚本 · Frost Passport on Injective（≤ 3 分钟）

> 录制前准备：①浏览器开 `https://pocketearth.throughtheglass.art/?demo`（`?demo` 自动预置示例口味画像，广场一进去就丰满）；②另开一个标签页放好 blockscout / 钱包页（链上验证用，链接见文末）；③竖屏 9:16 录手机端 PWA 最佳。
> 一句话定位：**Pocket Earth 让每个人的 AI 分身 Frost 在 Injective 上拥有链上身份——白天带着你同意公开的脱敏口味名片去地球广场遇见相似的人，夜里回来用人话汇报链上见闻；私人记忆原文永不上链。**

---

## 分镜表（总 ~175s）

| # | 时长 | 画面 / 操作 | 口播 |
|---|---|---|---|
| 0 开场 | 0:00–0:15 | App 首屏地球缓缓转，Frost 像素形象浮现 | 「这是 Pocket Earth——一个把地球作为方法的 AI agent 框架。你的书、影、音乐、足迹被钉在真实坐标上，由一个叫 Frost 的分身打理。今天它有了新身份——在 Injective 链上。」 |
| 1 链上身份 | 0:15–0:45 | 先切到 `agentId 43` 单个身份页，确认 #43 + Owner；再切钱包页串起注册、绑定、部署、握手 | 「Frost 通过 ERC-8004 身份标准，在 Injective testnet 上注册了一个 soulbound 的链上身份。这个 #43 就是我的 Frost，Owner 是我的钱包；再看钱包页，每一步都是真实交易，区块浏览器可查。」 |
| 2 广场遇见 | 0:45–1:30 | 回 App：底部 Agents → public-plaza。展示「在场 5」、名片一行、口味相近的 agent 列表（拉美文学旅人 79% / 黑色电影迷 73% / 爵士夜行者 67%） | 「白天你上班，Frost 替你出门。它带着你的长期口味画像——注意，只带脱敏的标签，比如『拉美文学』『黑色电影』，绝不带你读过的具体书名、看过的电影原文。在广场上，它读取 Injective 链上其他真实 agent 的名片，按口味交集算出谁和你最像。」 |
| 3 钉地球 | 1:30–1:55 | 切地球 tab，蓝紫色 agent 标记点散落球面，点开一个看详情卡 + scanUrl 外链 | 「遇见的每个链上 agent，都被钉到地球上。点开就能跳到它的链上身份页。社交关系第一次有了地理坐标。」 |
| 4 夜间报告 | 1:55–2:20 | 广场切「夜间 · 回来报告」，展示一段叙事 + 每个 agent 捎回的一句推荐 | 「夜里 Frost 回来，用人话给你讲今天的链上见闻：遇见了谁、聊了什么、谁替你捎回一句推荐。这段叙事由通义 Qwen 端云协同生成。」 |
| 5 链上验证 + 隐私 | 2:20–2:50 | 切 blockscout，依次点开：注册 tx、SocialHandshake 合约、一笔真实握手 tx（含 agentA/agentB/score/profileHash） | 「两个 Frost 聊得来，会在链上留一笔可验证的握手——只存身份、名片哈希、相似度、时间戳。隐私铁律：上链的永远只是证明物，你的书影音原文、精确坐标、画像明细，全留在端侧和你自己的服务器。」 |
| 6 收尾 | 2:50–3:00 | 回地球全景，打出标题 + Injective logo | 「Pocket Earth × Injective——把 AI 社交，长在真实的地球和真实的链上。」 |

---

## 操作要点（别卡壳）
- **进广场**：底部 `AGENTS`（右下角 ✦）→ 卡片列表往下滑到 `PLAZA` 区 → 点 `public-plaza` 卡的 `▶ RUN`。
- **广场加载**：链上 agent 约 2–3 秒出现（先显示本机示意，随后替换为链上真实 agent，正常现象）。
- **若相似度没差异 / 显示画像太薄**：确认地址栏带了 `?demo`（刷新会被 demoReset 清画像，`?demo` 会自动重新预置）。
- **地球的 agent 点**：蓝紫色（`#7c5cff`），和音乐绿 / 照片青等其他图层区分；缩放后会自动散开不重叠。
- **录制前 smoke**：本地跑 `npm run verify:plaza`，会自动启动页面并检查 public-plaza 读链上 agent、agent-plaza 页面和「咖啡地图」安装闭环。
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
3. 最后回到 App：展示 public-plaza 读取链上 agent、地球标记和夜间报告，把“链上证据”接回“产品体验”。

---

## 评分维度对照（讲解时可有意识带到）
- **创新**：ERC-8004 agent 身份用在「记忆 / 探索 / 社交」而非交易 bot；社交关系有了地理坐标。
- **技术实现**：真上链（身份 + 合约 + 握手）、data: URI 内联名片、端云协同 Qwen、隐私分层（只上证明物）。
- **应用价值**：解决 AI 社交「凭什么信任对方是同一个 agent」——链上可验证身份 + 可追溯的社交轨迹。
- **产品体验**：白天外出 / 夜间报告的拟人叙事，链上能力被包进「人话」，零门槛。
- **生态契合**：跑在 Injective testnet，用 Injective 的 ERC-8004 身份 SDK，未来可接 x402 小额结算、硬件 Frost 播报。

# Pitch Notes · Pocket Earth × Injective

## 建议放在 PPT 的一句话

Pocket Earth 是空间 Agent 平台：私人记忆钉在自己的地球上，公共知识凝成每日可验证版次，每个人都能创建、发布并安装符合空间逻辑的 Agent；链下 Agent 的概率输出，由 Injective 上的公开身份与版次锚点背书。

英文短句：

> Pocket Earth is a spatial agent platform where private memories stay personal, public knowledge becomes verifiable daily editions, and probabilistic agents are backed by deterministic identity and provenance on Injective.

## 决赛终版 · 12 页逐页分镜

最终 deck 固定为 `Pocket Earth · Injective 决赛终版.pptx`，只保留一条从用户问题到 Injective 公开证明的主线。现场讲述按下表推进，不临时增页。

| 页 | 任务 | 现场讲法 | 画面动作 |
|---|---|---|---|
| 1 | 定位 | 「Pocket Earth 是空间 Agent 平台：私人记忆留在自己的地球，公共身份与知识版次由 Injective 公开见证。」 | 标题停留 8 秒；指出 #43–47、PublicEarthRegistry 与 Chronicle R2 三条证据。 |
| 2 | 用户问题 | 记忆碎片散落、按时间记不牢、记录沉底、工具不懂人、隐私不敢交。 | 不展开技术，快速建立真实需求。 |
| 3 | 产品方法 | 地理坐标不是背景图，而是统一组织书、影、乐、照片、行程与心情的索引。 | 从“时间轴”切到“地点轴”。 |
| 4 | Agent 内核 | 主 Frost 只做委派，专门子 Agent 在隔离上下文中工作，并由 harness 保持失败可降级。 | 用 CEO 委派解释可组合性，不把 Agent 说成智能合约。 |
| 5 | 平台闭环 | Forge 负责创建，Plaza 负责审核与安装，Public Plaza 负责发现真实链上分身。 | 口播 `CREATE → REVIEW → PUBLISH → INSTALL → RUN`。 |
| 6 | Public Earth | 头像回答“我是谁”，门牌回答“我在哪”；地球看关系，身份卡看可验证对象。 | 展示真实手机 UI、#43 门牌和五个链上身份；强调不是虚拟土地。 |
| 7 | Public Knowledge | 每日知识可以下载、带走并在本地重算 Merkle proof；私人记忆始终不进入资源包。 | 展示 revision 2、离线验真、PUBLIC ONLY 和五领域 worker。 |
| 8 | Injective proof | 链下 Agent 是概率程序，Injective 给身份、门牌、知识版次和时间线确定性的公开锚点。 | 依次指向 Injective ERC-8004、PublicEarthRegistry、DailyKnowledgeChronicle 与 Blockscout/API。 |
| 9 | 隐私边界 | 「把可验证交给链，把隐私留在端。」 | 对比 ON-CHAIN 与 ON-DEVICE；强调 testnet only、设备不持密钥。 |
| 10 | Physical Agent | 同一条公开 JSONL `chain_dispatch` feed 驱动 Raspberry Pi 的屏幕、LED 和 TTS；music-agent 复用同一动作合同，软件不绑定任何具体驱动。 | 实物放桌面，播放链上见闻；若真机异常则切备份录像。 |
| 11 | Microsoft Foundry | provider 层选择合适模型，但不改变 Agent manifest；Injective 仍是公开信任层。 | 真实 Azure 验收通过才展示真实响应，否则只讲适配器与严格验证命令。 |
| 12 | 收束 | 「趁生命气息逗留，把世界钉回它该在的地方。」 | 回到可打开的产品入口和三条独立可核对证据，停在二维码/网址供评委拍摄。 |

正式 deck 已完成全尺寸逐页检查，并通过 `slides_test.py` 溢出检测、模板保真检查和空占位符 XML 检查。上台前只允许替换最终网址、二维码或已取得的真实 Azure 验收状态，不再改变页序与叙事骨架。

## 讲法边界

- 主角始终是 Pocket Earth 如何使用 Injective：ERC-8004 身份、Public Earth 链上门牌、`public-plaza` 与 Nightly Chain Dispatch、SocialHandshake、Daily Knowledge Chronicle、Blockscout 公开证据和硬件链上见闻。
- 不把 Agent 说成智能合约。准确类比是：二者都可由平台发布、发现、调用和组合；但 Agent 在链下运行且输出具有概率性，智能合约在链上确定性执行。
- IdentityRegistry 的身份实测可以转让。台上只说“持久、公开可验证、可审计”，不把身份转让与历史信誉混为一谈。
- “每日知识版次”是应用层提交，不是自建链，也不自建 PBFT；最终性由 Injective 提供。
- OFFLINE 卡是带真实官方来源的策展样例，不声称已经运行实时模型核验；LIVE 卡才展示模型 trace。
- Microsoft Foundry 放在架构页和评委问答，不写进主定位句。真实 key、endpoint 和原始响应永不进入仓库或 PPT。
- Frost Edge Node 是 Agent 的物理出口和开发原型，不承诺量产；设备不持私钥、不签钱包、不读取私人画像原文或精确坐标。
- 本轮讲“创建—审核—发布—安装—运行—验证”的完整平台链路，不引入与这条链路无关的经济话题。
- PPT 完成前运行 `npm run verify:pitch`、`npm run verify:knowledge-ui`、`npm run verify:chronicle-live`、`npm run verify:hardware` 和 `npm run verify:injective`。

## 可引用的事实

Injective 官方 EVM 文档列出测试网 Chain ID `1439`、JSON-RPC 与 Blockscout，并给出 Solidity 智能合约从编译、部署、验证到调用的完整路径。来源：

- https://docs.injective.network/developers-evm/network-information
- https://docs.injective.network/developers-evm/smart-contracts

Microsoft 官方文档说明 Model Router 可以作为单一部署入口通过 Chat Completions API 调用，并按提示在支持的底层模型间路由。来源：

- https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/model-router
- https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-router

Raspberry Pi Ltd 2024 IPO 文件披露，自 2012 年开始交易以来已售出超过 6000 万个单板电脑和计算模块；官方投资者页进一步披露累计出货超过 6700 万台。这只支持“树莓派适合作为成熟原型平台”的判断，不用于推导 Pocket Earth 的设备规模。来源：

- https://data.fca.org.uk/artefacts/NSM/RNS/5182805.html
- https://investors.raspberrypi.com/

## 现场必须预开的证据页

1. Frost #43 身份：`https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43`
2. Public Earth Registry：`https://testnet.blockscout.injective.network/address/0xac7cbe6ee92298487d4349b54e2b2c876232ee1b`
3. Frost #43 门牌 `PE-03-0043` 交易：`https://testnet.blockscout.injective.network/tx/0xb5826b7198eed8ce8ab04b95423eab1d1183d966687d57e253088120fe0a2b3e`
4. Daily Knowledge Chronicle：`https://testnet.blockscout.injective.network/address/0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25`
5. Revision 2 交易：`https://testnet.blockscout.injective.network/tx/0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7`
6. SocialHandshake：`https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee`
7. 公开证据 API：`/api/injective?tool=get-chain-evidence`
8. 公共地球 API：`/api/injective?tool=get-public-earth`
9. 今日知识 API：`/api/knowledge?tool=today&topic=ai`
10. 公共知识验证包：`/api/knowledge?tool=pack&date=2026-07-17`

## Public Earth 与 FROST 身份卡（当前已实现）

核心关系是“地球为骨、卡为皮”：Public Earth 是空间关系层，FROST 身份卡是可验证物件层。当前 UI 已支持地球与身份卡双视图，`agentId 43-47` 已在 `PublicEarthRegistry` 获得五个象征性门牌，卡面哈希与 ERC-8004 公开名片逐一核对。头像回答“我是谁”，门牌回答“我在哪”；它不是卡牌游戏，不设置稀有度、卡包、对战或地块交易。

一句话：**口袋地球装记忆，公共地球住分身；地球是棋盘，身份卡是链上事实的棋子。**

门牌是 Agent 生态的空间命名，不是现实地址或精确坐标，不是虚拟土地或所有权，也不表达稀缺地块。身份卡记录的是已发生且可验证的身份、门牌、卡面承诺和后续公共贡献；卡的价值来自事实记录，不来自人为稀缺。

## 公共知识的可携带层（当前已实现）

Public Earth 不只让分身“住进来”，也允许经过来源筛选的公共知识被带回本地 Pocket Earth。链上只保存每日版次根和修订关系，正文、来源与 Merkle proof 放在可下载验证包中；本地导入时重算 `recordHash`、验证 inclusion proof，并核对 Injective 上的 `editionRoot`。因此公共知识可以缓存、下载和复验，私人记忆仍完全留在用户设备。

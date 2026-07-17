# Pitch Notes · Pocket Earth × Injective

## 建议放在 PPT 的一句话

Pocket Earth 是空间 Agent 平台：私人记忆钉在自己的地球上，公共知识凝成每日可验证版次，每个人都能创建、发布并安装符合空间逻辑的 Agent；链下 Agent 的概率输出，由 Injective 上的公开身份与版次锚点背书。

英文短句：

> Pocket Earth is a spatial agent platform where private memories stay personal, public knowledge becomes verifiable daily editions, and probabilistic agents are backed by deterministic identity and provenance on Injective.

## PPT 页内建议

1. **Problem**：书、电影、音乐、照片、行程和心情散落在不同工具里；公共信息又缺少来源、版次和复验入口。
2. **Private Earth**：Pocket Earth 用真实地点组织私人知识；Frost-agent 端云双脑负责挑选、寻找、表达和反思，原始记忆与精确坐标不上链。
3. **Public Earth**：公共地球是空间 Agent 社会的关系层。Injective ERC-8004 身份回答“它是谁”，`PublicEarthRegistry` 的象征性分区与门牌回答“去哪里找到它”；地球视图看关系，身份卡视图看可验证对象。
4. **Agent Platform**：Agent Forge 把自然语言需求编译为声明式 manifest；Agent Plaza 按空间对象、权限、端/云运行位置和链上身份审核、发布、安装与运行 Agent。
5. **Public Chronicle**：Daily Knowledge Curator 筛选 AI 与金融领域公共知识，保存来源、verdict、truthScore、recordHash 与 Merkle proof，生成每日知识版次。用户可以下载自包含验证包，在本地重算记录哈希和 Merkle 路径，再与 Injective 上的版次根核对。
6. **Injective proof**：Injective ERC-8004 `agentId 43-47` 是公开可验证的 Frost 身份；`PublicEarthRegistry` 已为五个身份写入门牌与卡面哈希；`DailyKnowledgeChronicle` 合约保存每日版次 head。当前公共地球合约为 `0xac7cbe6ee92298487d4349b54e2b2c876232ee1b`，知识合约为 `0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25`，2026-07-17 版次已更新到 revision 2。
7. **Physical Agent**：Frost Edge Node 让同一 Agent 拥有物理出口。Raspberry Pi 只消费公开 JSONL 事件，把 music-agent、知识版次和 Injective `chain_dispatch` 链上见闻映射成屏幕、TTS 与 LED 反馈。
8. **Model Routing**：统一 provider 层已经支持 Microsoft Foundry Model Router 主路由与 Qwen 降级。只有真实 Azure 请求完成后，才在台上表述为已接入；此前只展示已完成的适配器与验证骨架。

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

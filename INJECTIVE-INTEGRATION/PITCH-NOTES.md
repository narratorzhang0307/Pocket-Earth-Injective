# Pitch Notes · Pocket Earth × Injective

## 建议放在 PPT 的一句话

Pocket Earth 是空间 Agent 平台：私人记忆钉在自己的地球上，公共知识凝成每日可验证版次，每个人都能创建、发布并安装符合空间逻辑的 Agent；链下 Agent 的概率输出，由 Injective 上的公开身份与版次锚点背书。

英文短句：

> Pocket Earth is a spatial agent platform where private memories stay personal, public knowledge becomes verifiable daily editions, and probabilistic agents are backed by deterministic identity and provenance on Injective.

## PPT 页内建议

1. **Problem**：书、电影、音乐、照片、行程和心情散落在不同工具里；公共信息又缺少来源、版次和复验入口。
2. **Private Earth**：Pocket Earth 用真实地点组织私人知识；Frost-agent 端云双脑负责挑选、寻找、表达和反思，原始记忆与精确坐标不上链。
3. **Agent Platform**：Agent Forge 把自然语言需求编译为声明式 manifest；Agent Plaza 按空间对象、权限、端/云运行位置和链上身份审核、发布、安装与运行 Agent。
4. **Public Chronicle**：Daily Knowledge Curator 筛选 AI 与金融领域公共知识，保存来源、verdict、truthScore、recordHash 与 Merkle proof，生成每日知识版次。
5. **Injective proof**：Injective ERC-8004 `agentId 43-47` 是公开可验证的 Frost 身份；`DailyKnowledgeChronicle` 合约保存每日版次 head。当前合约地址为 `0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25`，2026-07-17 版次已更新到 revision 2。
6. **Physical Agent**：Frost Edge Node 让同一 Agent 拥有物理出口。Raspberry Pi 只消费公开 JSONL 事件，把 music-agent、知识版次和 Injective `chain_dispatch` 链上见闻映射成屏幕、TTS 与 LED 反馈。
7. **Model Routing**：统一 provider 层已经支持 Microsoft Foundry Model Router 主路由与 Qwen 降级。只有真实 Azure 请求完成后，才在台上表述为已接入；此前只展示已完成的适配器与验证骨架。

## 讲法边界

- 主角始终是 Pocket Earth 如何使用 Injective：ERC-8004 身份、`public-plaza` 与 Nightly Chain Dispatch、SocialHandshake、Daily Knowledge Chronicle、Blockscout 公开证据和硬件链上见闻。
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
2. Daily Knowledge Chronicle：`https://testnet.blockscout.injective.network/address/0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25`
3. Revision 2 交易：`https://testnet.blockscout.injective.network/tx/0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7`
4. SocialHandshake：`https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee`
5. 公开证据 API：`/api/injective?tool=get-chain-evidence`
6. 今日知识 API：`/api/knowledge?tool=today&topic=ai`

## FROST 身份卡的后续产品方向

每个 FROST 可以拥有一张可视化 Agent 身份卡：卡面是角色形象，卡背是 agentId、能力版本、知识贡献和服务历史。卡牌属性只随可验证行为演进；Frost Edge Node 读取同一身份后加载对应头像、颜色、声音与技能包。卡、软件与硬件是同一个 Agent 的三个表面，硬件是身份的物理登录终端，而不是人为制造稀缺的收藏品。

## Agent Earth 的后续产品方向

Agent Earth 是 Pocket Earth 公共 Agent 生态的空间命名层：链上身份回答“它是谁”，象征性分区与门牌回答“去哪里找到它”，Daily Knowledge Chronicle 回答“它留下了什么公共知识”。未来可以研究 `AgentEarthRegistry(agentId → zoneId, doorplate, cardHash, version)`，并让现有 public-plaza 的地球标记进入 Agent 的空间主页。它不是现实地址、不是虚拟土地，也不表达稀缺地块或所有权；本周只作为 Roadmap，不进入主 Demo。

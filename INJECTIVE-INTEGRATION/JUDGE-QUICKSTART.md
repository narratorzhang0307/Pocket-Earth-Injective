# Judge Quickstart · Pocket Earth on Injective

> 一页、只读、测试网范围的核验路径。无需任何密钥，也不读取 Pocket Earth 私人记忆。

## 60-Second Path

1. 打开 Frost 主身份 `agentId 43`：https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43
2. 打开 Public Earth Registry：https://testnet.blockscout.injective.network/address/0xac7cbe6ee92298487d4349b54e2b2c876232ee1b；再读 `/api/injective?tool=get-public-earth`，核对 `agentId 43-47` 的门牌与卡面哈希。
3. 打开 Daily Knowledge Chronicle 合约：https://testnet.blockscout.injective.network/address/0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25
4. 打开 2026-07-17 revision 2 交易：https://testnet.blockscout.injective.network/tx/0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7
5. 读取今日知识：`/api/knowledge?tool=today&topic=ai`；下载 `/api/knowledge?tool=pack&date=2026-07-17`，在本地验证两个 `recordHash`、Merkle proof 与链上 `editionRoot`。
6. 读取 Frost 身份证据：`/api/injective?tool=get-agent-proof&agentId=43`；读取完整 fleet：`/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47`。
7. 读取硬件事件证明：`/api/injective?tool=get-hardware-bridge-proof`；软件 feed 使用 `GET /api/frost-feed?limit=1&after=<cursor>`，并要求 Bearer token。
8. 查看仓库与当前 `main`：https://github.com/narratorzhang0307/Pocket-Earth-Injective

## What This Proves

- `agentId 43-47` 是 Injective testnet 上可公开核验的 Pocket Earth Frost 身份，`builderCode=pocket-earth`。
- IdentityRegistry 身份可以转让；Pocket Earth 只把它描述为持久、公开可验证、可审计的 Agent 身份，不把身份转让等同于信誉继承。
- `PublicEarthRegistry` 是实际部署的 Injective EVM 智能合约；五个 Frost 已写入象征性分区、门牌、卡面承诺与修订号。门牌不是现实地址、精确坐标、虚拟土地或地块权利。
- `DailyKnowledgeChronicle` 是实际部署的 Injective EVM 智能合约；同一天的知识版次已经从 revision 1 演进到 revision 2，旧 root 作为 `previousEditionRoot` 保留。
- Daily Knowledge Curator 的 AI 与金融卡保存官方来源、verdict、truthScore、recordHash 和 Merkle proof；OFFLINE 卡明确标成策展样例。下载包自包含公开记录与 inclusion proof，本地无需信任 Pocket Earth 界面即可复验。
- Agent Forge/Plaza 已形成“创建—审核—发布—安装—运行”的产品闭环，并用空间对象、最小权限、端/云位置、链上身份约束上架范围。
- Frost Edge Node 只消费 `music_now_playing` 与 `chain_dispatch` 公开 JSONL 事件；设备动作限制为 `state`、`tts`、`display`，不持私钥、不签钱包、不读取私人画像原文或精确坐标。
- Microsoft Foundry Model Router 适配器已进入统一 provider 层；只有 `npm run verify:foundry-live:strict` 获得真实成功响应后，才在台上表述为已真实接入。`verify:foundry-provider` 只是离线契约测试。

## Injective Proof Matrix

| 证明 | 公开入口 | 本地守门 |
|---|---|---|
| Frost #43 身份 | `get-agent-proof&agentId=43` + Blockscout instance | `npm run verify:agent-proof` |
| Frost #43–47 fleet | `list-agents&builderCode=pocket-earth&limit=5&top=47` | `npm run verify:registry` |
| Public Earth 门牌 | `get-public-earth` + `0xac7c…ee1b` | `npm run verify:public-earth-live` |
| Public Earth 双视图 | Pocket Earth `PUBLIC EARTH` | `npm run verify:public-earth-ui` |
| SocialHandshake | `0xe5338a162a44a685201e1f6120b1a851949e3aee` | `npm run verify:handshake` |
| Chronicle 合约 | `0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25` | `npm run verify:chronicle-contract` |
| 知识版次 revision 2 | tx `0x19364…296c7` | `npm run verify:chronicle-live` |
| 记录 inclusion proof | `/api/knowledge?tool=proof&recordHash=...` | `npm run verify:knowledge-api` |
| 可下载公共知识包 | `/api/knowledge?tool=pack&date=2026-07-17` | `npm run verify:knowledge-pack` |
| Frost Edge Node feed | `/api/frost-feed` | `npm run verify:frost-feed` |

## Agent Platform Fast Check

1. 在 Pocket Earth 打开 `AGENTS`，运行 `agent-forge`，用一句话生成声明式 manifest。
2. 打开 `agent-plaza`，检查卡片的空间对象、权限、端/云位置与 Injective 徽章。
3. 运行 `public-plaza`，在 PUBLIC EARTH 切换地球 / 身份卡视图，点开 #43 的 `PE-03-0043` 门牌与链上证据。
4. 运行 `daily-knowledge`，切换 AI / 金融，打开来源链接，点击“验证记录”和“下载验证包”，再打开 revision 2 explorer。
5. `public-plaza` 负责从 Injective 发现真实 Agent；`agent-plaza` 负责审核、发布、安装和运行，二者职责分开。

## Daily Knowledge Chronicle Fast Check

| 字段 | 期望值 |
|---|---|
| network | `Injective EVM Testnet` |
| chainId | `1439` |
| contract | `0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25` |
| day | `20260717` |
| revision | `2` |
| factCount | `2` |
| editionRoot | `0x6e62dcc3fe00495d15d2a7600a5dff6a9f396b85f641fd5316ff69b8327491da` |
| previousEditionRoot | `0x90e20c7b3e2e4c96e1dd4404cba79e815fc9d19e22fb751f43e9cd57d4a5e601` |

## Frost Edge Node Fast Check

- 合同版本：`pocket-earth.frost-event/v0.1.0`。
- 传输：JSONL over authenticated HTTP feed；opaque cursor 防重播。
- `chain_dispatch` 的 agentIds 来自服务端实时 Injective 读链，speak 由服务端模板生成。
- Pi consumer 与 Pocket Earth 主 App 解耦；无主服务时可用 fixture 开发和演示。
- 硬件只把公开事件带回房间，私人记忆仍留在用户自己的设备。

## Public Earth + FROST Identity Card

Public Earth 已实现地球 / 身份卡双视图：地球看关系，卡片看身份、门牌和卡面承诺。卡、软件和硬件可以是同一个 Agent 的三个表面，但我们只借卡面美学，不借稀有度、卡包、对战或投机逻辑。**口袋地球装记忆，公共地球住分身。**

## Review Package

- GitHub: https://github.com/narratorzhang0307/Pocket-Earth-Injective
- Live demo: https://pocketearth.throughtheglass.art/?demo
- Demo video (`reviewEntrypoints.demo-video`): https://youtu.be/KjmrjTnvVo0
- Public evidence API: `/api/injective?tool=get-chain-evidence`
- Public Earth API: `/api/injective?tool=get-public-earth`
- Daily knowledge API: `/api/knowledge?tool=today&topic=ai`
- Daily knowledge pack: `/api/knowledge?tool=pack&date=2026-07-17`
- Hardware proof API (`reviewEntrypoints.hardware-bridge`): `/api/injective?tool=get-hardware-bridge-proof`

## Local Commands

```bash
npm run build
npm run verify:judge
npm run verify:agent-proof
npm run verify:registry
npm run verify:handshake
npm run verify:chronicle-contract
npm run verify:chronicle-live
npm run verify:knowledge-api
npm run verify:knowledge-ui
npm run verify:knowledge-pack
npm run verify:public-earth-contract
npm run verify:public-earth-live
npm run verify:public-earth-api
npm run verify:public-earth-ui
npm run verify:frost-feed
npm run verify:foundry-provider
# 填好本机服务端配置后运行；会真实调用 Azure，缺凭据或请求失败均非零退出
npm run verify:foundry-live:strict
npm run verify:hardware
npm run verify:injective
```

## Demo Reading Order

地球私人记忆 → Public Earth 门牌 / 身份卡 → Daily Knowledge 验证包 → Chronicle revision 2 → Frost #43 身份 → Frost Edge Node 链上见闻。

一条边界贯穿全部演示：链上放公开身份与知识版次，端侧留私人生活。

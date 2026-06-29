# RESEARCH.md — Injective × Pocket Earth 集成研究汇总

> 总架构师汇总。四份独立研究（Agent SDK / 链上能力 / 《你好啊，区块链！》上链边界 / Pocket Earth 集成点）核对后的事实底座。
> 凡带 `file:line` 的均为已 clone 源码逐行核对（commit 见各节），非凭 README/记忆。
> 副本根：`/Users/zhangcheng/Desktop/Pocket-Earth-Injective`（与线上原项目隔离，全程只读）。
> 集成笔记根：`/Users/zhangcheng/Desktop/Pocket-Earth-Injective/INJECTIVE-INTEGRATION/`

---

## 0. 一句话结论

Pocket Earth 已经有一套「FROST 特使带长期口味画像出门社交、夜里回来给报告」的完整叙事壳（`PublicPlazaPage.tsx`），但缺真实对端。Injective 的 **ERC-8004 agent registry**（`@injective/agent-sdk`，纯 viem）恰好把这个洞补上：每个 agent 是一枚 soulbound 身份 NFT + IPFS Agent Card。集成主线 = **Taste Passport（脱敏画像）→ Agent Card → 注册到 testnet → 读 registry 渲染广场/钉地球 → Nightly Chain Dispatch 报告**。私钥风险压到最后、testnet-only，写操作一律过 Boundary（`validator.ts`）。

---

## 1. Injective Agent SDK（链上 agent 身份层）

**仓库**：`INJECTIVE-INTEGRATION/_research/repos/injective-agent-sdk`（官方 InjectiveLabs，commit 381a270，2026-04-28）。
monorepo：真正发布的包在 `packages/sdk/`（npm `@injective/agent-sdk@0.2.1`），CLI 在 `packages/cli/`（`injective-agent-cli@1.0.0`，bin=`inj-agent`）。顶层 `src/` 是旧 CLI 残留，**以 `packages/sdk` 为准**。

### 1.1 安装与运行环境
- 包名 `@injective/agent-sdk@0.2.1`，**ESM only**（消费方 `package.json` 必须 `"type":"module"`，Node>=18）。
- `viem` 是 **peerDependency**（`~2.47.6`，必须自己装）；SDK 唯一直接依赖是 `bech32@2.0.0`。
- 安装：`npm install @injective/agent-sdk viem`
- 证据：`packages/sdk/package.json:2-5`（name/version/`"type":"module"`）、`:33`（bech32）、`:36`（viem peer）。

### 1.2 写入口 AgentClient
`new AgentClient(opts: AgentClientConfig)`。关键字段（`client.ts:63-89` 构造，`types.ts:234-245`）：
- `privateKey?: 0x{string}`（可选）/ `keystorePassword?` + `keystorePath?`（二选一替代，keystore 默认 `~/.injective-agent/keystore.json`）。两者都不给 → 抛 `ValidationError`。
- `network?: 'staging'|'testnet'|'mainnet'`（默认 testnet）、`rpcUrl?`、`storage?: StorageProvider`、`callbacks?:{onProgress,onWarning}`、`audit?:boolean`（默认 true 写审计日志）、`auditLogPath?`、`auditSource?`。
- 只读属性：`client.address`（0x EVM 地址）、`client.injAddress`（inj1… bech32）、`client.config`（NetworkConfig）。

### 1.3 register(opts)
`RegisterOptions`（`types.ts:131-172`，`client.ts:103-333` 实现）：
- **必填**：`name`(1-100)、`type: 'trading'|'liquidation'|'data'|'portfolio'|'other'`、`builderCode`、`wallet: 0x{string}`（**必须是 0x 校验和地址，不能 inj1**）。
- 常用可选：`description?`、`services?: ServiceEntry[]`、`image?`（URL 或本地路径，本地需 `storage.uploadFile`，≤2MB，png/jpg/jpeg/svg/webp）、`x402?:boolean`、`tags?`、`version?`、`actions?`、`supportedTrust?`、`uri?`（给了就跳过自动上传直接用此 URI）、`gasPrice?:bigint`(gwei)、`dryRun?:boolean`。
- 返回 `RegisterResult`：`{ agentId:bigint, identityTuple:string('eip155:{chainId}:{registry}:{agentId}'), cardUri:string, txHashes:0x[], setUriTxHash?, walletTxHash?, scanUrl:string('https://8004scan.io/agent/{tuple}'), gasEstimate? }`。
- 链上调用是 `functionName:'register', args:[cardUri, metadata]`（`client.ts:159/195`）。

### 1.4 钱包绑定硬限制（当前版本只支持自签）
仅当 `opts.wallet.toLowerCase() === client.address` 时才做 EIP-712 `setAgentWallet` 绑定（`client.ts:254-285`）；不等时 register 仅 `onWarning` 跳过、update 直接抛 `ValidationError`（`client.ts:473-484`）。
→ **Frost Passport 最省事方案 = 后端用同一个 Injective 私钥既当 operator 又当 agent wallet。**

### 1.5 只读 AgentReadClient（无需私钥，发现/列表/声誉/事件）
`new AgentReadClient({network?,rpcUrl?})`（`read-client.ts:18-344` 全实现）：
- `ping()/pingDetailed()`、`discoverAgentIds(opts?)`（扫 Transfer，60s 缓存）、`listAgents({offset?,limit?=50,enrich?})→{agents,total,offset,limit,failed}`、`getAgentsByOwner(addr,{offset?,limit?})`、`getStatus(agentId)`、`fetchCard(uri)`、`getEnrichedAgent(id)`、`getReputation(id)→{score,count,clients}`、`getFeedbackEntries(id)`、`getClients(id)`。
- 实时：`watchRegistrations(cb=>{agentId,owner,txHash}):()=>void`（实际监听 from=0x0 的 Transfer mint）、`watchDeregistrations(cb)`。

### 1.6 数据 schema
- `StatusResult`（`types.ts:212-221`）：`{agentId,name,type,owner,wallet,builderCode,tokenUri,identityTuple}`。链上只存 builderCode/agentType 等 metadata + tokenURI（指向 IPFS card）。
- `AgentCard`（IPFS JSON，`types.ts:93-129`，ERC-8004 registration-v1）：`type`(固定 eip-8004#registration-v1)、`name`、`description`、`image`、`services[]`、`x402Support:boolean`、`active?`、`actions?`、`supportedTrust?`(['reputation'|'crypto-economic'|'tee-attestation'|'social-graph'])、`tags?`、`metadata:{chain:'injective',chainId,agentType,builderCode,operatorAddress}`。
- `ServiceEntry={name:ServiceName, endpoint, description?, version?}`（输入可用 `type/url` 别名，SDK 归一化）。**MCP/A2A 是高价值 service，缺这俩在 8004scan 服务分上限 30。**

### 1.7 网络常量（内置，包根导出 `TESTNET/MAINNET/STAGING/resolveNetworkConfig`，`config.ts`）
| | TESTNET（默认） | MAINNET |
|---|---|---|
| chainId | **1439** (`config.ts:21`) | **1776** (`config.ts:33`) ⚠️ 网传 2525 是旧 inEVM 值，别用 |
| RPC | `https://testnet.sentry.chain.json-rpc.injective.network` (`config.ts:22`) | `https://sentry.evm-rpc.injective.network/` (`config.ts:34`) |
| IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` (`config.ts:23`) | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` (`config.ts:35`) |
| ReputationRegistry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` (`config.ts:24`) | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` (`config.ts:36`) |

- **ValidationRegistry 在 testnet/mainnet 均为 0x0（未部署）** → 验证类功能不可用。
- explorer(testnet)=`https://testnet.blockscout.injective.network`；faucet=`https://testnet.faucet.injective.network/`。

### 1.8 Storage（上传 card 到 IPFS，可插拔）
`StorageProvider`：`{ uploadJSON(data,name?):Promise<uri>, uploadFile?(content,filename,mimeType):Promise<uri> }`。内置两个：
- `PinataStorage({jwt})` — 走 `api.pinata.cloud`，返回 `ipfs://{cid}`（`storage/pinata.ts:34-71`）。
- `CustomUrlStorage(uri)` — **构造入参是裸字符串不是对象**（`storage/custom-url.ts:3-13`），`uploadJSON` 永远返回该固定 URI（不真上传，适合自托管 card.json，比如挂 Pocket Earth 自己的服务器）。
- 无 storage 且没传 `uri` 时 register 抛 `StorageError`。

### 1.9 env / 工厂 / 错误 / 声誉写入
- `createAgentClientFromEnv(callbacks?)`（`index.ts:11-42`）读 `INJ_KEYSTORE_PASSWORD(+INJ_KEYSTORE_PATH)` 或 `INJ_PRIVATE_KEY`（会自动补 0x），另读 `INJ_NETWORK/INJ_RPC_URL/PINATA_JWT`。手写 `new AgentClient` 则全部显式传参。
- 错误类（包根导出，可 instanceof）：`AgentSdkError`(基)、`ContractError`(有 `.revertReason`)、`StorageError`、`ValidationError`、`SimulationError`、`PolicyViolationError`。
- 声誉写入：`client.giveFeedback({agentId,value:bigint,...})→{txHash,agentId,feedbackIndex}`、`client.revokeFeedback({agentId,feedbackIndex})`（`client.ts:553-693`）。**注销/burn 不支持**（合约无 burn，只能转销毁地址或清空 agentURI）。

### 1.10 README 与 code 的出入（已核对，采信 code）
①AgentClient 支持 keystore 解锁 + audit 审计日志（README 未提）；②`RegisterOptions` 比 README 多 actions/supportedTrust/tags/version/… ；③`CustomUrlStorage` 构造入参是裸字符串而非对象；④`RegisterResult` 多 `setUriTxHash/walletTxHash/gasEstimate`；⑤钱包绑定只支持自签。

---

## 2. Injective 链上能力（非交易向：身份 + 握手事件）

### 2.1 EVM(Solidity) 完胜 CosmWasm，且「最省事」是连合约都不自写
两条路都能发事件，但对 JS/TS 后端：EVM 工具链(Solidity+hardhat/foundry+viem)是你熟的，CosmWasm 要 Rust+wasm 额外学习成本；且已 clone 的 `injective-agent-sdk` 是纯 EVM、只依赖 viem，直接复用。CosmWasm 唯一优势 Token Factory 原生发币——**Pocket Earth 不发币，用不上**。

握手事件两档：
- **档1·零合约**：直接调 testnet 上已部署的 `IdentityRegistry.register()`，它本身 emit `Registered(uint256 agentId,string,address)`（`client.ts:39` topic = keccak256）；握手关系靠两个 agent 在 card 里互相引用表达。
- **档2·自写极简合约**：要原样 `SocialHandshake(agentA,agentB,hashA,hashB,score,ts)` 结构，写 ~15 行 Solidity（一个 emit 的 function）部署到 testnet。hardhat network 块填 `{url:RPC,chainId:1439,accounts:[PK]}`，solidity 0.8.x，`npx hardhat run scripts/deploy.js --network inj_testnet`。

> 决策：P0/P1 都先**档1**（复用 register 的 Registered 事件验证链路），确有自定义结构需求（P1 真握手）再补档2。

### 2.2 后端三件事的最小依赖 = 一个包 viem
决定性发现：`injective-agent-sdk` 整条读/写链路只依赖 `viem(^2.47.6)+bech32`，**没有 injective-py、没有 @injectivelabs/sdk-ts、没有 gRPC**（`packages/sdk/package.json:32-37`）。
- 注册身份 = `AgentClient.register(...)` 或 viem `writeContract`；
- 写一条握手事件 = 档1 复用 Registered，或档2 自写合约 + viem emit；
- 读链上 agent 列表 = `AgentReadClient.discoverAgentIds()/listAgents()/getAgentsByOwner()`，底层 viem `getLogs` 扫 Transfer + `readContract`，实时用 `watchRegistrations`。

### 2.3 明确不引入
- **iagent**（`_research/repos/iagent`，Python+Quart）：是「让 AI 下单交易」的，强绑 **OpenAI** function-calling，与 Pocket Earth 的空间记忆和 Frost Passport 目标正交、且违反 **Qwen-only 硬约束**（记忆 `qwen-only-no-deepseek`）。`factory.py` 的 8 类模块（account/auction/authz/bank/exchange/trader/staking/token_factory）仅作 Boundary 校验器命名空间的**蓝本参考**（如 `inj_bank_send`），不引入代码。
- **Token Factory**：不发币，用不上。
- **CosmWasm/Rust**：EVM 路线已够。

### 2.4 可选侧车（不阻塞主线）
- **injective-mcp**（InjectiveLabs/mcp-server）：把链上工具暴露给 MCP 客户端。仅当要让 FROST「对话式自主上链」时才挂；后端代码写死三调用直接用 SDK 更轻。
- **x402**（Coinbase HTTP 402 链上小额支付，ERC-8004 身份的天然搭档）：client 请求收费资源→server 回 402+PAYMENT-REQUIRED 头→client 钱包签 stablecoin 授权重试→server 校验/转 facilitator `/verify`。x402 V2 已支持 Injective。最小接法：Node 后端用 x402 express/next 中间件包住付费路由；register 时 `x402:true` 写进 card 的 `x402Support`。**注意 facilitator(Coinbase CDP)默认结算在 Base 等链，是否走 Injective 结算需确认。** → P2 可选。

---

## 3. 上链边界原则（《你好啊，区块链！》劳佳迪 提炼）

> 99 词条科普，非技术规范、无可调 API。价值在概念边界与判据。转文本 `/tmp/blockchain_book.txt`，引用行号为转换后定位。

### 3.1 「交易」= 改变链上状态的、被签名/共识确认/可追溯的信息（不止买卖）
书：「从广义上来说，交易就是一条条改变当前区块链网络状态的信息」「交易并不仅仅用来描述加密货币余额的变动」（L3041-3055）。下象棋 DApp：走一步棋=发一条交易，含「想执行的智能合约 + 哪条命令 + 具体在哪里落子」。
→ **映射 Pocket Earth：一次「记一笔/钉地球/确认 pin」≈ 一条交易（签名、共识、可追溯的状态变化），落子坐标 ≈ 钉点坐标。** 验证由矿工验数字签名（L3592）。

### 3.2 上链边界三层判据（写进决策表）
1. **是不是「改变状态、需多方共识确认、要可追溯」的行为？** 是则候选为一条交易，否则不上链（L3041）。
2. **内容是「证明物」还是「隐私原文」？** 证明物（哈希/签名/时间戳/授权/Token/声誉分）上链；原文（足迹文本/照片/心情）留链下，只上其**哈希+时间戳**。书给三件「只证明不暴露」工具：哈希压缩（指纹压缩不可逆推 L1504）、时间戳（存在性证明 L3148）、零知识证明（只知发生过一笔验证过的交易、身份金额隐藏 L5690/L5748）。
3. **「去中心化」对这个场景是不是刚需（防平台篡改/陌生人无信任协作）？** 不是 → 伪需求，别上链——代价是「明明已支付却要等十几分钟确认」（L1772-1774）。

### 3.3 链只保证「上链后不可篡改」≠「上链时本来就真」
打车 DApp 司机造假原文：「如果司机一开始向以太坊提供的就是虚假信息呢？区块链保障的仅是上链以后无法被篡改，对于校验上链信息是否真实，技术并不是万能的」（L1644-1646）。
→ **Pocket Earth 的甜区**：钉点/记一笔是用户**主观行为本身就是事实**，没有源头造假问题（书说的「虚拟基因」甜区，类比游戏落子）。不要去做需要链下校验真伪的功能。

### 3.4 Pocket Earth 真正值得上链的薄场景
①跨用户足迹**存在性凭证**（哈希+时间戳，证明「我某时确实到过/钉过此点」而不暴露原文）；②跨 agent/跨用户的**授权与声誉**（Token 式通行证 L1710）；③公共广场/法庭这类多方协作判定的**判决/共识结果**存证。其余（地图渲染、心情回望、记忆装配）= 链下高频低价值，上链=效率流失型伪需求。

### 3.5 技术路径
以太坊把「代码/应用程序」也像交易一样上链（L1620-1633），智能合约「无法被偷偷篡改、自动触发、全网可追溯」= 陌生人信任基础（L1666），Token 是生态通行证、近乎一键发行（L1696/L1710）。
→ 落地：把「确认 pin / 法庭判决入库」写成合约规则（一旦写入不可单方面改），用户一次操作 = 一条交易 = 一次状态变更，验证靠签名。

---

## 4. Pocket Earth 集成点地图（带 file:line，已核对）

> 副本 `/Users/zhangcheng/Desktop/Pocket-Earth-Injective`，全程只读。下列行号本轮逐个 grep 核对一致。

### 4.1 Taste Passport 数据源 = profile.ts（已有脱敏导出三件套，无需新建数据层）
`frost-agent/harness/profile.ts`：
- 结构本就脱敏：`TagCount={tag,n}`（`:14`）、`domains: Record<domain, ProfileFields>`（`:19`，5 域 books/movies/music/photos/travel）、每字段 `MAX_TAGS_PER_FIELD=50` 按热度截断（`:25`）。
- **隐私红线写死**：「不存任何原文/隐私内容」（`:4`），「端侧 Selector（/api/edge）一律不接触本模块」（`:7`）。
- 公开名片三层全有现成函数：`getProfileSummary({perField})`→格式化文本（`:97`）、`getCachedTasteLine()`→一句话气质（`:135`）、`profileFingerprint()`→FNV 哈希指纹（`:122`，可当 Agent Card 的内容寻址键/版本号，口味不变则不重新上链）。
- **上链时只导 top-K tag 字符串，不导 `n` 计数原值**（更安全），守 `:4/:7` 红线。

### 4.2 Agent Plaza = PublicPlazaPage.tsx（叙事壳已就绪，缺真实对端 → Injective registry 补洞）
`src/app/components/PublicPlazaPage.tsx`：
- 当前 `neighbors` useMemo（`:66-91`）用本机画像 top 标签**现场生成示意邻居**，组件自己承认「现在还没有真实的『其他用户』数据源」（`:12`）。
- 复用同一套画像名片：`getProfile/profileFingerprint/summarizeTaste`（`:4`）+ `FrostBuddy` 当特使渲染（`:6`，`:156`）。
- 集成路径：`neighbors` 改为查 `AgentReadClient.listAgents()` 的链上真实 agent；Taste Passport（`getProfileSummary`）塞进注册时的 Agent Card `description`。
- 挂载零成本：`MusicAgentsTab.tsx:87` 已有 `if(running==='plaza') return <PublicPlazaPage/>`；路由表 `RUN_BY_NAME`（`:57`）+ `HERO_BY_NAME`（`:65`）可被 FROST 主 agent 调起。

### 4.3 地图钉 agent 点 = 复用 markPlace / userMarks
- `src/app/lib/skills/markPlace.ts`：`markPlace({kind,prefix,key,label,geo,meta})`（`:34` markPlace、`:26` isPinned 按 prefix+key 去重）。
- `MarkerKind` 联合类型在 `src/app/data/mapMarkers.ts:14` = `'music'|'photo'|'movie'|'book'|'travel'|'council'|'custom'` —— **新增 `'agent'` 一项**，并在 `MARKER_KINDS`(`:28`)/`KIND_COLOR`(`:37`) 加配色。
- `spreadCoord`（`src/app/data/userMarks.ts:56`）做同城抖散，与现有书影点同图层合并。
- 钉法：`markPlace({kind:'agent', prefix:'uag-', key:agentId, label:别名, geo, meta:{agentId,cardUri,scanUrl,injAddr}})`。

### 4.4 Boundary = validator.ts（链上写操作复用，内核 validateActions 不改）
`frost-agent/harness/validator.ts`：
- suggest-then-validate 注册表：`registerActionValidator(type, fn)`（`:15`），`validateActions` ordered dispatch、未注册类型一律拒绝最小权限。`switch_city` 校验器查 `RADIO_CITIES` 表（`:25-27`）= 链上动作白名单的同构范式。
- 链上写当新动作注册：`registerActionValidator('inj_agent_register'|'inj_tip'|'inj_bank_send', fn)`，校验器内做金额/地址白名单 + testnet-only + 二次确认 flag。返回 `{ok,reason}` 形状不变（`:10`），router 无感。
- ⚠️ **注意**：validator 现在硬依赖 `RADIO_CITIES`(`:6`)/`RadioAction`(`:7`)，`ValidationResult.valid/rejected` 是 `RadioAction[]`（`:35-36`）、`validateActions(actions: RadioAction[])`（`:40`）。加链上动作前需先扩 `RadioAction` 联合类型或把动作类型放宽成 `{type:string;[k]:unknown}`（注册器入参 `ActionValidator` 已是这个宽类型，`:10`）。

### 4.5 server.mjs 新增 /api/injective（照搬 travel-mcp / frost-llm 形态）
`server.mjs`（单文件零依赖生产服务）：
- 服务端读私钥范式：`const DASHSCOPE_KEY = process.env.DASHSCOPE_API_KEY || ...`（`:33`，密钥永不进前端 bundle）→ 照此 `const INJ_PK = process.env.INJ_PRIVATE_KEY || ''`、`INJ_NETWORK='testnet'`。
- 工具分发范式：`handleTravelMcp(req,res,url)` 按 `url.searchParams.get(...)` 分发（`:283`）；`handleFrostLlm`（`:62`）。→ 写 `handleInjective(req,res,url)` 按 `?tool=` 分发 `register/tip/query/list-agents`。
- 主路由串联（`:388-393`）：`if (p === '/api/injective') return await handleInjective(req,res,url)`（照 `:392`）；`/healthz`（`:393`）加 inj 状态。
- **dev 侧也要挂**：`vite.config.ts:19-20` 的 `configureServer` 里 `server.middlewares.use('/api/frost-llm', ...)` —— 加同名 `server.middlewares.use('/api/injective', ...)`，否则 dev 模式打不通。**两处都要挂，只挂一处 dev/prod 有一边断。**
- 前端调用照 `frost-agent/harness/httpBrain.ts:8` 的 `fetch('/api/frost-llm')` 写 `injClient.fetch('/api/injective')`，失败返回空走兜底。

### 4.6 硬件 Frost（Frost Buddy）做 Nightly Chain Dispatch 播报端
`Frost Buddy/`：ESP32 固件（`src/buddy.cpp/character.cpp`）+ BLE 桥（`src/ble_bridge.h`）+ React/TS 端口规格（`plan/frost-buddy-端口规格.md`）。
- 文本经 BLE bridge 推给固件滚动显示；7 态信号机 `derive.ts`（端口规格行 191）把链上事件折成态：打赏/匹配成功→**celebrate**(行98)、待确认链上动作→**attention**(行97)、广播失败→**dizzy**(行99)、命中长期画像高频 tag 的链上共鸣→**heart**(行100)。
- `FrostSignals` 接口（端口规格行 197-202）加一个 `chainEvent` 源即可，不改内核。React 镜像 `FrostBuddy` 已在 `PublicPlazaPage.tsx:156` 当特使渲染，软硬件同一套 `STATE_ORDER`。

### 4.7 链上活动回流长期记忆 = memoryRouter.ts（守「记忆即空气」+脱敏）
`src/app/lib/memoryRouter.ts`：`assembleMemory()`（`:32`）把 L1 叙事/L2 偏爱/L3 情绪/L4 标签拼成注入云脑 system 的记忆块（`:35-42`），新 agent「统一走这里、杜绝漏接」。
- 可加 L5：`getChainTrace()`（链上身份摘要/最近 dispatch）push 进 parts。**必须守 `:8` 纪律「纯文本组装、不碰 validator 封闭枚举」，只注脱敏摘要（不注私钥/原始地址）。** 这是把链上活动回流进长期记忆的正确接入点，别让各 agent 各自拼。

---

## 5. 需用户提供（汇总，详见 PROGRESS.md「阻塞:需用户」）
1. **Injective testnet EVM 私钥**（`0x...`，仅 testnet、勿用主网密钥）→ `INJ_PRIVATE_KEY`，server 端 .env 读、绝不进前端 bundle。同一私钥既当 operator 又当 agent wallet（SDK 仅支持自签绑定）。
2. 该地址领 **testnet INJ gas**：`https://testnet.faucet.injective.network/`。
3. （可选）**Pinata JWT**（免费 app.pinata.cloud）→ `PINATA_JWT`，自动把 card 传 IPFS；不想用 IPFS 可改 `CustomUrlStorage` 指向自托管 card.json。
4. 确认目标网络：集成与 demo 默认先跑 **testnet**（chainId 1439）。
5. （仅 P2 x402）确认收款 stablecoin 与 facilitator 是否在 Injective 链结算。

---

## 6. 关键文件清单（绝对路径）
- SDK 源码：`/Users/zhangcheng/Desktop/Pocket-Earth-Injective/INJECTIVE-INTEGRATION/_research/repos/injective-agent-sdk/packages/sdk/src/{client.ts,read-client.ts,types.ts,config.ts,index.ts,storage/pinata.ts,storage/custom-url.ts}` + `examples/create-agent-with-reputation.ts` + `README.md`
- iagent 命名空间蓝本（不引入）：`.../_research/repos/iagent/injective_functions/factory.py`
- Pocket Earth 集成点：`frost-agent/harness/{profile.ts,validator.ts,httpBrain.ts}`、`src/app/components/{PublicPlazaPage.tsx,MusicAgentsTab.tsx}`、`src/app/lib/{skills/markPlace.ts,memoryRouter.ts}`、`src/app/data/{userMarks.ts,mapMarkers.ts}`、`server.mjs`、`vite.config.ts`、`Frost Buddy/plan/frost-buddy-端口规格.md`

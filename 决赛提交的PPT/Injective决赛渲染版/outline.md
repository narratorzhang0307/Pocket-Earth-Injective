# Pocket Earth on Injective · 决赛渲染版 PPT 大纲

> 状态：DRAFT · 等待用户确认页序与取舍后进入逐页渲染  
> 输出方向：16:9、4K（3840×2160）整页渲染图；最终再按顺序装入 `.pptx`，用于现场播放。  
> 视觉母版：`ppt风格参考/CarryTheCosmos_上街去_论坛配图_重编号版`。标准内容页沿用“浅灰网格底 + 左文右双截图 + 三角标注 + 黑色等宽标题”；架构页沿用 A/B/C/D 浅色分层框图；硬件页沿用真机对照、功能拆解和端云边界版式，但全部换成 Pocket Earth 的真实界面与 Frost Edge Node。

## 0. 这套 Deck 的沟通任务

- **观众**：Injective 决赛评委，包含 Microsoft 评委。
- **希望评委最后相信的事**：Pocket Earth 不是另一个聊天机器人，而是一套已经工作的空间 Agent 平台；私人记忆、公共知识、链上身份与实体 Frost 被同一个产品闭环连起来，Injective 是不可替代的公开信任层，Microsoft Foundry 是可替换模型之上的统一智能路由层。
- **主定位句**：Pocket Earth 是空间 Agent 平台：私人记忆钉在自己的地球，公共知识凝成每日可验证版次，每个人都能创建、发布并安装符合空间逻辑的 Agent；链下 Agent 的概率输出，由 Injective 上的公开身份与版次锚点背书。
- **叙事收束句**：空间留在 Pocket Earth，时间由 Injective 见证。
- **演讲纪律**：主 Deck 不谈付费、代币、升值、抽成、虚拟土地或卡牌经济；不提其他链；不把 Agent 说成智能合约；不把 ERC-8004 身份说成 soulbound；不说知识正文上链。

## 1. 主 Deck：15 页

### 01｜封面：POCKET EARTH ON INJECTIVE

**本页只传达一个结论**：一颗装私人记忆、公共知识与 Agent 分身的地球，已经由 Injective 公开见证。

- 标题：`POCKET EARTH ON INJECTIVE`
- 中文副题：`口袋地球 · 空间 Agent 平台`
- 主句：`把记忆钉回地球，把身份与知识版次交给 Injective 见证。`
- 角标只放三项事实：`agentId 43–47`、`PublicEarthRegistry`、`DailyKnowledgeChronicle R2`。

**画面**：电影海报式封面。中部是 App 的私人地图/公共知识地图叠成一颗地球；右下角放真实 Frost Edge Node；五张 Frost 身份卡像轨道物件环绕，但保持克制。Injective 绿色只作为能量线与小面积高光。

**版式参考**：重新渲染，不直接套标准页；继承参考图的网格、粗黑线、橙色注释与等宽标题。

**需要素材**：最终 App 首页、公共知识地图、实际硬件照片、`public/frost-identities/` 五张身份图。

---

### 02｜问题：AI 时代有两种“过剩”

**本页只传达一个结论**：私人记忆越来越碎，公共信息越来越多；真正缺少的是可找回的记忆和可复验的知识。

- 私人侧：书、影、乐、照片、行程与心情散落在不同 App，记过却找不回。
- 公共侧：AI 让内容生成无限便宜，但噪声、重复、失真和版本漂移一起增加。
- 判断：数据不是知识；只有经过筛选、核验、压缩和版本化的内容才有长期价值。
- 转折：Pocket Earth 用“空间”整理私人记忆，用“可验证版次”整理公共知识。

**画面**：左侧两组极简问题卡；右侧两张手机截图，一张是碎片化记录，一张是公共新闻卡/知识卡。用一条绿色箭头把“碎片/噪声”导向下一页的地球。

**版式参考**：标准内容页 `图03_Cosmos总起_把书读成地图.png`。

---

### 03｜总解法：一颗地球，三层系统

**本页只传达一个结论**：Pocket Earth 的完整产品不是单一知识库，而是私人空间层、公共 Agent 层和实体交互层组成的系统。

- `PRIVATE EARTH`：私人记忆与原图留在端侧，以真实坐标为主键。
- `PUBLIC EARTH`：公开 Agent、象征性门牌、身份卡和每日知识版次。
- `FROST PLATFORM`：Agent Forge 创建，Agent Plaza 审核/发布/安装/运行，Frost Edge Node 把公共事件带回房间。
- `INJECTIVE`：公开身份、门牌承诺、握手与每日版次根的确定性见证层。
- `MICROSOFT FOUNDRY`：模型路由与云脑基础设施，不改变 Agent 的 manifest、身份和证据。

**画面**：四层总架构图。上方是手机里的 Private/Public Earth；中间是 Frost Agent Platform；左下 Microsoft Foundry，右下 Frost Edge Node；最底层是一条贯穿全页的 Injective 公共见证层。

**版式参考**：`附图_架构图A/B/D` 的浅色层级图，不做“技术堆栈墙”。

---

### 04｜私人地球：把“在哪”变成记忆主键

**本页只传达一个结论**：地理坐标不是背景图，而是统一组织个人知识与生活记忆的索引。

- 六类私人对象统一落点：书、影、乐、照片、行程、心情。
- 一条记录被确认后，地球立即多一个点；缩放后从信号点展开成照片贴、心情贴或内容卡。
- 端侧识图与脱敏先处理敏感内容；原图、票据、证件与精确私人位置不上链。
- 一句话：`记一笔，地球立刻多一个点。`

**画面**：左侧 3 条短文；右侧两张纵向截图——私人地球总览 + 放大后的记忆卡片。用参考图同款 A/B 三角标注解释“全球尺度/街道尺度”。

**版式参考**：`图03_Cosmos总起_把书读成地图.png`、`图10_MYMAP双模式.png`。

**需要素材**：从最终线上版重新截取 Private Map 两个缩放层级。

---

### 05｜Agent 平台：每个人都能造，但不是所有 Agent 都进入地球

**本页只传达一个结论**：Pocket Earth 是面向知识管理、内容创作与空间体验的 Agent 平台，而不是无边界工具市场。

- `CREATE`：一句需求生成声明式 manifest。
- `REVIEW`：工具、权限、数据边界和空间逻辑进入审核闸门。
- `PUBLISH / INSTALL / RUN`：发布到 Agent Plaza，安装进自己的 Pocket Earth，再由 Frost 运行。
- 主 Frost 像 CEO：专门子 Agent 在隔离上下文工作，只回流结构化结论。
- 平台保留统一内核，领域差异由配置表达；新增领域不复制整套代码。

**画面**：左侧流程 `CREATE → REVIEW → PUBLISH → INSTALL → RUN`；右侧两张截图：Agent Forge 与 Agent Plaza/运行页。底部用一句小字强调“只收空间原生、知识与内容类 Agent”。

**版式参考**：`图01_FROST_skill层_内容包与管线.png` + `图02_FROST_AGENTS控制台与RunTrace.png` 的组合语法。

---

### 06｜公共地球：把公开知识做成一张可以接近的地图

**本页只传达一个结论**：公共地球不是链上土地，而是公开知识与 Agent 身份的空间可视化入口。

- 地图上落的是带地点、主题、来源和状态的知识便签；点开先看缩略卡，再进入完整详情。
- 顶部三视图解耦：`知识地图 / 知识详情 / 身份卡牌`。
- 门牌是 Agent 生态的象征性空间身份，不是现实地址、地块产权或稀缺资产。
- 一句话：`口袋地球装记忆，公共地球住分身。`

**画面**：采用已认可的浅色 Mapbox 地图，新闻便签贴在地图上；右侧放知识详情卡。地图边界线保持细、便签有轻微旋转和纸张阴影。

**版式参考**：标准内容页；地图视觉以当前 Pocket Earth 公共知识地图为准，不再使用黑色科技地图。

**现成素材**：`output/image-to-editable-ppt/20260718-224828-图03_Cosmos总起_把书读成地图/pages/page_001/assets/public-knowledge-map-fresh.png`、`public-knowledge-detail-fresh.png`。

---

### 07｜八个领域子 Agent，共用一条知识炼制管线

**本页只传达一个结论**：不是八套互相复制的爬虫，而是一个知识整理内核，加八个领域配置子 Agent。

- 八个领域：AI、科技、金融、气候、科学、健康生命、文化、政策社会。
- 共用管线：检索 → 去重 → 聚焦 → 交叉核验 → 确定性评分 → 人工批准 → Merkle 版次。
- 每条知识保留来源、摘要、`truthScore`、`ClaimKey` 与精确快照 `recordHash`。
- 候选新闻不会冒充已核验事实；只有满足证据门槛并进入版次的记录才获得长期身份。

**画面**：一张横向五至七阶段管线图；上排八个彩色领域 Agent 汇入同一内核，下排输出“知识卡/资源包/版次根”。

**版式参考**：`图05_MAPPING考据管线五阶段.png`。

---

### 08｜知识冷热记忆：七天看全量，长期只留精华

**本页只传达一个结论**：完整新闻有保鲜期，经过筛选与证明的知识才进入长期记忆。

- `L1 工作记忆`：当日抓取、候选、模型 trace 与临时处理状态。
- `L2 七日热缓存`：保留最近七天的完整新闻工作区，支持重跑、对照和回溯；到期自动清理。
- `L3 长期记忆`：只保存人工批准的主张、最终来源、recordHash、Merkle proof、edition root 与 Injective 交易。
- “遗忘”删掉冗余原料，“巩固”保留经过筛选的公共知识；它与 Frost 的分层记忆采用同一思想。

**画面**：从“宽而热”收束到“窄而久”的倒金字塔/漏斗；右侧画一条 7 天时间带，超过第 7 天的全量新闻淡出，精选知识进入永久档案。

**版式参考**：`附图_架构图C_长期记忆_浅色版_4K.png`。

---

### 09｜为什么必须是 Injective：给概率 Agent 一个确定性锚点

**本页只传达一个结论**：Agent 可以更新、模型可以切换、输出带概率；身份与版本证据必须确定、公开、可独立核对。

- `端上渲染`：私人地球、公共地图与交互。
- `内容在包里`：正文、来源、评分与 Merkle proof 放在可下载资源包。
- `指纹在链上`：Injective 保存 ERC-8004 身份、门牌/cardHash、握手与每日 editionRoot。
- 一天只提交一个 32-byte 总根；用户浏览和本地复验不需要发交易。
- 更正不覆盖历史：新 revision 指向旧 root，旧版仍能被核对。

**画面**：手机/资源包/Injective 三列边界图；把“概率层”和“确定性层”用一条粗分界线切开，最右侧给出本地 proof 验证回路。

**版式参考**：`图17_架构边界_手机与树莓派.png` 与架构图 A 的混合版式。

**本页金句**：`渲染在端上，内容在包里，指纹在链上。`

---

### 10｜不是概念：四组 Injective 证据已经能独立核对

**本页只传达一个结论**：评委不需要相信口播，可以自己复验合约、交易、API 与 UI 的同一组事实。

- `IdentityRegistry`：agentId `43–47`，Frost 主身份为 `#43`。
- `PublicEarthRegistry`：`0xac7c…ee1b`，五个象征性门牌和卡面承诺已写入。
- `DailyKnowledgeChronicle`：`0x3f0e…0c25`，`2026-07-17 / revision 2 / 2 facts`，真实 editionRoot 与交易可查。
- `SocialHandshake`：`0xe533…3aee`，`43 ↔ 44 / score 88` 的真实事件。
- 同一证据也由只读 API 暴露；Blockscout、API 与产品界面三方互证。

**画面**：四张编号证据票据，配两张真实 Blockscout 截图和一个小型“UI ↔ API ↔ CHAIN”三角校验图；二维码只放页脚，不让地址淹没画面。

**版式参考**：参考图的硬证据/标注页语言；本页比标准页更像“审计台”。

---

### 11｜Frost 身份卡：卡片是身份的形，不是投机的经济学

**本页只传达一个结论**：同一 Frost 在 App、公共地球、身份卡与实体设备中保持可识别，每个人又能由公开的脱敏标签长出差异。

- ERC-8004 身份卡是 agentId 的公开身份界面，不代表 Agent 代码、版权、私人记忆或现实地址。
- `统一轮廓`带来品牌识别；`个人细节`带来情感归属。
- 当前五个 Frost 身份：core / literature / noir / jazz / aurora，对应 agentId `43–47`。
- 不设置稀有度、开包、对战或升值叙事；每张卡的价值来自它记录的真实链上事实。
- 品牌句：`Frost 不是吉祥物，是产品本身——一个努力理解你、替你整理人生的 Agent。`

**画面**：五张身份卡横向牌组，中央 #43 最大，两侧可见其他卡；配一条 App → Card → Device 的统一轮廓演化线。

**版式参考**：当前 Public Earth 身份牌组 + 参考图的“内容包/物件卡”视觉。

**现成素材**：`public/frost-identities/frost-43-core.png` 至 `frost-47-aurora.png`。

---

### 12｜Microsoft Foundry：模型可以切换，Agent 与证据不切换

**本页只传达一个结论**：Microsoft Foundry Model Router 负责给任务选择合适的模型，但 Agent 的 manifest、权限、身份和 Injective 证据保持稳定。

- `端侧 Selector`：分类、排序、隐私敏感视觉与规则兜底，负责“挑和找”。
- `Microsoft Foundry Model Router`：统一云端模型入口，按任务复杂度路由，负责“写与综合”。
- `Provider compatibility layer`：同一请求契约、同一 RunTrace、失败自动回落，不把应用锁死在单一模型。
- `Agent manifest 不变`：模型是可替换执行资源；Injective identity / editionRoot 是不随模型更换的公开事实。
- PPT 按最终完成态表达；赛前用 `verify:foundry-live:strict` 留下真实 2xx、provider、model 与 request id 验收证据。

**画面**：左侧 Pocket Earth 任务队列；中间 TASK/MODEL 路由卡；右侧 Microsoft Foundry Model Router；下方一条 Injective 证据层贯穿，强调“模型路由层≠信任层”。

**版式参考**：`附图_架构图B_GMI融合_浅色版_4K.png`，把 GMI 全部替换成 Microsoft Foundry 的真实架构。

---

### 13｜Frost Edge Node：让链上分身在房间里拥有身体

**本页只传达一个结论**：同一条公开事件链路已经驱动真实树莓派的屏幕、LED 与 TTS，硬件是 Agent 的物理出口。

- `chain_dispatch` 公开 JSONL feed → device token → cursor 防重播 → Pi sidecar。
- Pi adapter 只翻译为 `state / display / tts` 三类动作；设备不持私钥、不签钱包、不读取私人记忆。
- 三个实际入口：`日落电台`（音乐 Agent）、`口袋播客`（知识版次的音频表达）、`地球答案`（每日行动指南）。
- App / 身份卡 / 设备沿用同一 Frost 形象系统；手机镜像负责让评委看清小屏。
- 现场主 demo 是公共链上见闻；音乐播放不作为决赛环境中的必需步骤。

**画面**：中央真实 Frost Edge Node；左边手机/Injective 事件，右边三类硬件动作；底部放三张 Whisplay 真机界面。使用真实白色外壳与橙色按键，不照搬参考图里的概念硬件造型。

**版式参考**：`图13_真机与概念终端对照.png`、`图14_硬件功能.png`、`图18_树莓派终端内部分层.png`。

**现成素材**：`work/hardware-qa/root-final.png`、`podcast-preview-final.png`、`earth-answer-large.png`；正式渲染前补拍最终真机正面照。

---

### 14｜60 秒闭环：一条知识如何从世界回到房间

**本页只传达一个结论**：地图、Agent、Merkle、Injective 与硬件不是五个并列功能，而是一条端到端产品链路。

1. 八领域 Agent 找到真实公开信号并交叉核验。
2. 通过门槛的知识进入当天资源包并生成 recordHash / Merkle proof。
3. 每日 editionRoot 提交到 Injective，形成不可改写的版次时间线。
4. Public Earth 在地图上展示知识便签，用户点开缩略卡再展开详情并本地复验。
5. Frost #43 读取公开事件，Edge Node 亮灯、显示证据卡并播报一句链上见闻。

**画面**：五帧横向分镜，像参考图的闭环流程，但每帧都用真实产品截图；最后一帧是硬件实物。箭头只走一条主线，避免画成系统总架构。

**版式参考**：`图15_地点召回闭环.png`。

**口播金句**：`白天，Frost 以链上身份去公共地球；夜里，它把经过验证的世界带回房间。`

---

### 15｜收束：空间留在 Pocket Earth，时间由 Injective 见证

**本页只传达一个结论**：这是一套现在能打开、能运行、能被独立核对的空间 Agent 平台。

- 主句：`趁生命气息逗留，把世界钉回它该在的地方。`
- 产品入口：`pocketearth-injective.throughtheglass.art/?demo`
- 代码：`github.com/narratorzhang0307/Pocket-Earth-Injective`
- 三条核验入口：Frost #43、PublicEarthRegistry、DailyKnowledgeChronicle revision 2。
- 页脚：`Built on Injective · AI routing with Microsoft Foundry`

**画面**：大面积留白 + 地球/硬件同框的收束海报；右下放网址与二维码，地址只保留短地址，不再塞技术说明。

**版式参考**：独立海报页，延续封面视觉，形成首尾闭环。

## 2. Appendix / 评委追问备用页：7 页

### A1｜60 秒证据索引

- 合约地址、交易哈希、Blockscout、只读 API、验证命令一页对表。
- 用于回答“你如何证明真的上链了”。

### A2｜隐私与安全边界

- ON-DEVICE / RESOURCE PACK / ON-CHAIN / EDGE NODE 四区。
- 明确原图、私人原文、精确私人地址、密钥各自永远不去哪一层。

### A3｜Frost Harness 与 RunTrace

- CEO 委派、隔离上下文、白名单工具、确定性护栏、降级路径、skill 单向依赖。
- 用于回答“这是不是只是几个 prompt”。

### A4｜知识证明细节

- `ClaimKey` 做语义去重，`recordHash` 锁定精确快照，inclusion proof 证明记录属于当天 editionRoot。
- 更正通过 revision，不覆盖历史。

### A5｜知识数据库与冷热存储

- SQLite/文件工作区负责七日热缓存与查询；`var/knowledge/editions/` 保存长期版次包；Injective 只保存总根和修订关系。
- 用于回答“为什么不是把数据库全放链上”。

### A6｜硬件内部结构与故障降级

- `/home/pi/sunset-radio` 与 `/home/pi/pocket-earth` 平行目录；Pocket Earth 内部多个子 Agent 平行。
- systemd、sidecar、Whisplay driver、local TTS、phone mirror；断网时缓存/字幕/离线 TTS 的降级路径。

### A7｜身份卡边界与路线图

- ERC-8004 身份可转让，不叫 soulbound；历史信誉来自真实公开服务记录而不是买卖。
- Frost 的下一步是跨端统一形象、更多知识版次与更多空间原生 Agent；不发币、不做稀缺卡包、不做虚拟土地。

## 3. 视觉系统锁定

- **画布**：16:9，4K，浅灰纸张底；细网格贯穿，但不压过截图和标题。
- **标题**：黑色像素/等宽字体；中文正文使用清晰无衬线字体，不再用过大的粗黑中文。
- **强调色**：Injective 绿为系统主高光；橙色只做编号/批注；八领域知识 Agent 使用柔和主题色。
- **截图**：手机截图必须来自最终线上版；统一圆角、白边、轻阴影；一页最多两张主截图。
- **标注**：沿用参考图的小三角 A/B/C、短引线和页脚说明；不用红圈、粗箭头或大面积科技霓虹。
- **地图**：浅色 Mapbox；国境线细、地点文字克制；新闻是便签，身份是小型公开信号，不用粗大圆点。
- **硬件**：只使用真实白色外壳、橙色按键的 Frost Edge Node；概念分解图也从真实轮廓出发。
- **成片方式**：每页先生成完整 4K 视觉，再装入 PPTX；PPTX 仅承担顺序、播放与备用页，不再以可编辑对象重搭画面。

## 4. 进入渲染前的取舍结论

- 从旧 41 页中保留：空间主键、Frost 起源、harness、Agent 平台、端云双脑、隐私、Injective 身份与硬件。
- 从旧 41 页中删除：作者履历独立页、功能逐项罗列、市场收入、平台抽成、付费回执、代币/SocialFi 对比、重资本硬件商业页。
- 用当前真实实现替换旧 roadmap：Public Earth Registry、DailyKnowledgeChronicle revision 2、知识冷热分层、Frost 身份牌组、真机三入口与 Public Earth 新 UI。
- Microsoft Foundry 进入第 12 页正式架构，不进入主定位句，不稀释 Injective 主角位置。
- 主 Deck 15 页；若最终 pitch 只有 5 分钟，可把第 04/05 页各压到 15 秒，把第 07/08 页合讲，把 A 页全部留作答辩，不改变主线。

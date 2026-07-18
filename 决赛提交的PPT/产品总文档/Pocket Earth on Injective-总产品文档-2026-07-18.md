# Pocket Earth on Injective

## 总产品文档与决赛备忘录

**版本**：2026-07-18 / 决赛冲刺版  
**项目展示名**：Pocket Earth on Injective  
**中文名**：口袋地球  
**产品形态**：移动端优先 PWA + 空间 Agent 平台 + Injective 公共见证层 + Frost Edge Node 实体终端  
**代码仓库**：https://github.com/narratorzhang0307/Pocket-Earth-Injective  
**决赛域名**：https://pocketearth-injective.throughtheglass.art  
**编写目的**：把本轮全部产品讨论、Claude/Codex 定稿、链上实现、知识系统、硬件交互、Azure 路线、竞赛叙事与口径边界收敛到同一份母文档，作为 PPT、口播、答辩、开发和验收的共同依据。

> **主定位句**  
> Pocket Earth 是空间 Agent 平台：私人记忆钉在自己的地球，公共知识凝成每日可验证版次，每个人都能创建、发布并安装符合空间逻辑的 Agent；链下 Agent 的概率输出，由 Injective 上的公开身份与版次锚点背书。

> **叙事收束句**  
> 空间留在 Pocket Earth，时间由 Injective 见证。

# 1. 执行摘要

Pocket Earth 最初是一款“基于空间的个人知识库”：把书、电影、音乐、照片、行程、心情等个人碎片重新钉回真实地理坐标，用“在哪”替代“哪一天、叫什么”成为记忆索引。随着 frost-agent、Agent Forge、Agent Plaza、Injective 链上身份、Public Earth、Daily Knowledge Chronicle 与 Frost Edge Node 的加入，它已经演进为一套由四个相互连接的层构成的空间 Agent 平台：

1. **私人空间层**：用户的书影音、照片、行程、心情与长期画像留在自己的 Pocket Earth；原始生活数据优先在端侧处理。
2. **公共 Agent 层**：公开的 Frost 分身、象征性门牌、身份卡与公共知识便签在 Public Earth 中被发现、浏览与验证。
3. **公共知识层**：八个领域子 Agent 每日搜集真实新闻，经过共享 Harness 的去重、聚焦、交叉核验、确定性评分和人工批准，形成可下载、可离线验证的每日知识版次。
4. **实体交互层**：Frost Edge Node 把公开知识、链上见闻、音乐与每日行动提示带回房间，通过 Whisplay 屏幕、RGB LED、TTS 与按键让 Agent 获得身体。

Injective 在其中不是装饰性的徽标，也不是支付插件，而是公开信任层：ERC-8004 身份回答“这个 Agent 是谁”，PublicEarthRegistry 回答“它在公共地球的哪个象征性门牌”，DailyKnowledgeChronicle 回答“这一批知识在什么版本、什么时间存在”，SocialHandshake 回答“哪两个公开分身发生过一次可核对的相遇”。正文、照片和私人生活不上链；链上只放公开身份、承诺哈希、版本根、修订关系与公开事件。

Microsoft Foundry Model Router 位于另一条正交轴上：它解决“这次任务该调用哪种模型”，不解决“这个 Agent 是谁、这个版本是否存在”。模型可以替换，Agent manifest、权限边界和 Injective 证据不随之替换。当前统一 provider 适配与离线契约测试已完成，真实 Azure 账号、endpoint 与部署将在 PPT 优先完成后配置，并以严格真实请求作为最终验收。

决赛的核心不是把所有功能都讲一遍，而是证明一条完整闭环：真实公开信号被知识 Agent 提炼为可验证版次，版次根写入 Injective，Public Earth 把知识重新放回地图，Frost #43 以公开身份读取这条见闻，实体 Frost 在房间里亮灯、显示并播报。

# 2. 产品的起点与精神内核

## 2.1 为什么从“地球”开始

个人信息管理工具通常依赖时间、文件夹、标签、双向链接或数据库字段。它们擅长整理，但不一定符合人类自然回忆的方式。用户可能想不起一本书的标题，却记得在京都的旅馆读完；想不起一张照片是哪天拍的，却记得是在西湖边。Pocket Earth 的第一性原理因此是：

> **把地理坐标当作个人知识与生活记忆的主键。**

地球不是视觉背景，而是统一索引层。每次记录一本书、一部电影、一首歌、一张照片、一段行程或一句心情，地球上都会增加一个可回看的空间对象。缩放到全球尺度，它们是轻量信号；靠近城市或街道，它们展开为拍立得、便签、票根或内容卡。

## 2.2 Frost 从哪里来

Frost 的文学灵感来自罗杰·泽拉兹尼《趁生命气息逗留》中一台努力理解人类的机器。Pocket Earth 没有把这个来源当作装饰性的彩蛋，而是把它转化为产品性格：Frost 不替用户拥有生活，也不擅自做主；它通过委派不同子 Agent 收集、整理和解释碎片，逐步理解“这个人是谁、关心什么、走过哪里”。

Frost 在产品中的五个构成已经齐全：

- **脸**：App 中的方头像素轮廓与五张 Frost 身份图。
- **身体**：树莓派 + Whisplay HAT 的 Frost Edge Node。
- **声音**：本地 MiniMax TTS 与离线 TTS 兜底。
- **性格**：白天出门发现公开世界，夜里回来讲述见闻；克制、好奇、可回退。
- **出身**：一台想理解人类的机器，与“替你整理人生”的产品功能是同一句话。

因此，Frost 的品牌句是：

> **Frost 不是吉祥物，是产品本身——一个努力理解你、替你整理人生的 Agent。**

## 2.3 从个人知识库走向空间 Agent 平台

项目演进经历了三次关键扩展：

1. 从“地图上的个人碎片”扩展到“主 Frost 委派专业子 Agent 整理并落点”。
2. 从“平台自己提供 Agent”扩展到“用户可以用 Agent Forge 创建、通过审核后发布到 Agent Plaza，并安装到自己的 Pocket Earth”。
3. 从“私人地球”扩展到“Public Earth”：公开 Agent 有身份、门牌和卡片，公共知识有地图、版次和验证包。

这使 Pocket Earth 不再只是一个具体应用，而开始具备协议层和生态层：空间知识库提供统一坐标、对象契约、落点工具、隐私边界和验证规则；不同 Agent 在这一层之上组合出知识管理、内容创作与空间体验。

# 3. AI 时代的问题：记忆碎片化与信息过剩

## 3.1 私人侧：记得越来越多，找回越来越难

用户的个人记忆散落在不同软件：书单、片单、音乐、相册、日历、备忘录、聊天记录和地图足迹相互割裂。主要痛点包括：

- 缺少统一索引，记录不能在同一条空间轴上相遇。
- 按日期和标题检索不符合很多真实回忆习惯。
- 内容记下后沉底，缺乏再次唤起与重组。
- 推荐系统看到行为，不一定理解长期偏好。
- 照片、票据、证件、定位与心情原文不适合整批交给云端。

## 3.2 公共侧：语料过剩，可信知识稀缺

生成式 AI 降低了内容生产成本，也放大了重复、误读、拼接、版本漂移与“看起来像真的”信息。Pocket Earth 对公共知识的判断不是“继续增加一个信息流”，而是把数据提炼为带来源、带版本、可复验的知识制品。

英国数学家 Clive Humby 在 2006 年提出了广为流传的比喻：

> “Data is the new oil. It’s valuable, but if unrefined it cannot really be used.”

用户在本轮讨论中采用的完整中文表达是：

> **“数据就是新石油。数据是有价值的，但如果没有提炼，就不能使用。必须像石油一样转化为气体、塑料、化学品等，以创建一个有价值的实体，推动盈利活动。因此，必须对数据进行分解和分析，使其具有价值。”**

Pocket Earth 吸收的不是“数据天然值钱”，而是“价值来自提炼”。对应到产品：

- 原始新闻和 RSS 信号是原油。
- 去重、聚焦、证据搜集、调查与质疑是炼制过程。
- `truthScore`、来源清单、recordHash、Merkle proof 是质量检验与批次记录。
- 可下载知识包是成品包装。
- Injective 上的每日 editionRoot 是公开质检章。

因此，Pocket Earth 要分发的不是更多消息，而是**干净、可靠、准确、可验证的知识版次**。

## 3.3 Web3 时代的知识分发

传统信息流依赖平台数据库与平台信誉。Pocket Earth 采用“资源包 + 公开版次根”的方式，把信任拆成可以被任何客户端独立执行的步骤：下载内容包、本地重算哈希、本地验证 Merkle inclusion proof、只读查询 Injective 上的 editionRoot。即便原平台消失，资源包只要仍在流通，任何兼容阅读器仍能验证它属于哪一个公开版次。

给技术评委的备用类比是：

> **Public Knowledge 是 AI 时代的可验证 RSS。**

它仍然保留订阅、分发和阅读器开放性，但每一期多了可独立核对的版次根与证据链。

# 4. 产品总结构：一颗地球，四个相互连接的层

| 层级 | 核心对象 | 用户价值 | 主要运行位置 | Injective 角色 |
|---|---|---|---|---|
| 私人空间层 | 书、影、乐、照片、行程、心情、画像 | 找回自己的生活与知识 | 手机/PWA/端侧 | 不保存私人原文 |
| 公共 Agent 层 | Agent 身份、门牌、身份卡、公开握手 | 发现可信分身与空间关系 | Public Earth + API | 身份、门牌承诺、公开事件 |
| 公共知识层 | 新闻信号、核验记录、每日版次、资源包 | 获得可复验的精选知识 | Node worker + App | 每日 editionRoot 与 revision |
| 实体交互层 | 屏幕、LED、TTS、按键、播客/电台/答案 | 让 Agent 在房间里具有存在感 | Raspberry Pi | 只读公开见闻，不持密钥 |

四层之间遵循一条稳定原则：

> **渲染在端上，内容在包里，指纹在链上。**

私人生活留在设备；公开内容放在可分发资源包；需要跨平台证明的身份与版本指纹交给 Injective。

# 5. 私人空间知识库

## 5.1 三个主入口

Pocket Earth 的移动端以三个底部入口组织体验：

- **Photos**：时间、日历、杂志三视图。杂志像双页手帐，灰度照片触碰后恢复彩色。
- **Earth**：私人地图与公共地球的核心入口。顶部明确区分 `Private Map / Public Earth`。
- **Agents**：Frost、领域 Agent、Agent Forge、Agent Plaza 与运行轨迹。

私人地图和公共地球在同一核心位置切换，是为了表达它们属于同一个产品，但隐私与公共性完全不同。

## 5.2 六类私人空间对象

- **书**：故事发生地、作者地、阅读地点或用户主动选择的意义地点。
- **电影**：取景地、叙事地点、国别或个人观影记忆地点。
- **音乐**：歌手出身地、歌曲所唱城市、演出地点或播放时刻的城市。
- **照片**：EXIF 坐标或端侧识别出的地点；只保存必要缩略图与经纬度。
- **行程**：已经走过的足迹、计划中的路线与城市。
- **心情**：含地点的即时记录，在 suggest-then-confirm 后落点。

这些对象通过统一 `markPlace`/store 契约写入地图。Agent 不直接操纵地图 UI，而是产出结构化落点，地图订阅数据后重绘。

## 5.3 万能“记一笔”

用户不需要先判断应该打开哪个 Agent。Jot 接收一句话或截图，先做意图判断，再委派给书、影、行程、心情等对应 Agent。所有自动落点必须遵循：

1. 模型或规则提出建议。
2. Boundary 校验对象、地点与字段。
3. 用户确认。
4. 写入统一 store。
5. 地球实时增加一个点。

这保证自动化始终可以解释、可以取消、可以回退。

## 5.4 照片隐私与端侧整理

照片 Agent 采用“便宜信号优先、模型只处理临界样本”的思路。浏览器内先用颜色桶、清晰度、重复度等信号筛选，再对必要样本运行 CLIP/视觉模型。原图不出端；需要共享或展示时只保存低分辨率缩略图，并对坐标做抽稀。

隐私不是模型提示词里的自觉，而是确定性代码边界：证件号、卡号、手机号等先经过本地规则脱敏；端侧模型、云端模型与链上层获得的字段互不相同。

## 5.5 私人长期记忆

Frost 的私人记忆不是一团无限增长的聊天记录，而是类型化分层：

- 工作记忆保持最近对话与当前任务连贯。
- 长期画像保存脱敏的偏好标签、城市、作者、导演、流派和频次。
- profile fingerprint 判断画像是否发生实质变化；没有变化就不重复调用云脑。
- 已看内容、已读内容和用户评分回流推荐，避免重复推荐。

公开知识的冷热架构与私人记忆遵循同一思想：信息不是保存得越多越好，而是需要压缩、巩固、检索与有边界的遗忘。

# 6. Frost Agent 平台

## 6.1 Frost 不是聊天框，而是 Harness

总 Frost 扮演 CEO。它不亲自吞下所有原始数据，而是把不同对象派给专业子 Agent，在隔离上下文中完成“感知—整理—定位—产出”，只把结构化结论返回主对话。

核心原则包括：

- **隔离**：网页噪声、相册批处理和失败尝试不污染主上下文。
- **约束**：每个 Agent 只获得必要工具；未知动作默认拒绝。
- **可组合**：通用能力沉淀为 skill，领域 Agent 只保留配置。
- **可观测**：RunTrace 展示 router、agent、skill、provider 与降级路径。
- **可回退**：云脑不可用时保留规则/端侧路径；端侧不可用时允许人工完成。
- **停止条件**：预算、轮数、证据数和工具调用数有硬上限。

## 6.2 Agent 与智能合约：平台逻辑相似，执行性质不同

早期讨论从“智能合约像链上的小程序”得到启发：一个基础平台可以允许开发者发布、发现、调用和组合许多独立程序。Pocket Earth 的 Agent 平台与这种生态逻辑同构，但不能把子 Agent 直接称为智能合约。

二者的准确区别是：

- 智能合约在链上确定性执行，相同输入应得到相同状态变化。
- Agent 在链下运行，模型与外部信息会变化，输出具有概率性。
- Agent manifest 类似可审计的部署描述，但不是链上执行代码。
- 正因为 Agent 会变化，才需要 Injective 上稳定的身份、版本和时间证据。

最适合上台的表述是：

> **Agent 像平台上的应用，但不是智能合约；Agent 负责理解与创造，Injective 负责把身份与版本变成确定事实。**

## 6.3 Agent Forge 与 Agent Plaza

平台闭环是：

1. `CREATE`：用户用自然语言描述要解决的空间/知识问题。
2. `COMPILE`：Agent Forge 生成声明式 manifest，包括领域、输入、输出、工具、权限和空间策略。
3. `REVIEW`：`reviewManifest` 拒绝未知字段、危险 URL、可执行代码和越界权限。
4. `PUBLISH`：符合生态边界的 Agent 才进入 Agent Plaza。
5. `INSTALL`：用户明确安装，manifest 写入本地 Agent 列表。
6. `RUN`：Agent 通过白名单 skill 运行，产出回流自己的 Pocket Earth。

平台并非接纳所有 Agent。当前优先范围是：

- 个人知识管理。
- 公共知识整理与核验。
- 内容创作和知识创作。
- 地点、路线、展览、餐厅、咖啡馆、演出等空间整理器。
- 与 Pocket Earth 的地图、记忆、公共地球或硬件端点产生真实关系的 Agent。

不符合空间逻辑、只提供泛聊天或要求越权访问的 Agent 不进入广场。

## 6.4 “每个人都能创造 Agent”的长期愿景

Vibe coding 降低了软件和 Agent 的创造门槛。传统 NFT 时代，用户常常创造或拥有一张静态数字作品；Agent 时代更有生命力的创作对象可能是一套持续工作的能力。Pocket Earth 的长期愿景是让每个人能够创造、发布和维护自己的 Agent，并从真实服务中获得长期价值。

但决赛已经明确：**主叙事不提付费**。本周证明的是创建、审核、发布、安装、运行和验证的完整平台链路，而不是收入。订阅、单次调用或服务回执属于后续产品设计，不进入决赛主 PPT，也不伪装成已经发生的收入。

# 7. Public Earth：公共地球

## 7.1 Public Earth 的角色

私人 Pocket Earth 回答“我记得什么”；Public Earth 回答“哪些公开 Agent 与知识正在世界上发生”。它是 App 中的公共空间关系层，也是链上事实的可视化入口。

Public Earth 不等于把整颗地球写入智能合约。地图、缩放、便签、详情卡和动画在手机 App 中渲染，避免把高频交互和大量正文变成 gas 成本。Injective 只保存需要公开证明的最小事实。

这项架构决策可以概括为：

> **公共地球在手机，公共事实在 Injective。**

## 7.2 顶部信息架构

地球入口顶部先区分：

- `PRIVATE MAP / 私人知识库`
- `PUBLIC EARTH / 公共地球`

进入 Public Earth 后再解耦为三个子视图：

- **知识地图**：只显示 Mapbox 地图和贴在地点上的新闻/知识便签。
- **知识详情**：按主题浏览缩略卡、左右切换同主题新闻、点击展开完整内容与来源。
- **身份卡牌**：横向查看 Frost #43–47 的身份卡，左右箭头切换，点击进入公开证明。

地图和详情分开，避免把地图、卡片、分类和证明挤在一个长页面中。

## 7.3 地图视觉原则

- 使用与私人地图一致的 Mapbox 能力，但公共层采用更明亮、纸质化的视觉。
- 国境线保持细，不抢占便签和城市信息。
- 公共新闻不是粗大的圆点，而是贴在地图上的纸张便签；缩放时由小信号点逐渐展开为标题卡。
- 便签可轻微旋转，配纸张阴影、针点与日期，形成“世界消息贴在地球上”的感受。
- 地图不展示用户现实家庭地址，也不把 Agent 的象征性门牌伪装成真实地址。

## 7.4 新闻卡与详情

一张知识卡是内容的缩略而不是全文。它包含：主题、地点、日期、来源、标题、一句摘要、Why it matters、核验状态。点击后展开：

- 更完整的事实描述。
- 来源列表与独立域名数。
- 调查方与质疑方结论。
- truthScore 与审核状态。
- recordHash、Merkle proof、editionRoot 和验证入口。
- 原始网页链接。

详情页不强行使用“非证据氛围图”。如果图片不能成为证据或不能提高理解，就直接让真实新闻和来源成为视觉主体。

## 7.5 地球为骨，卡片为皮

讨论曾在“做链上地球”与“做游戏卡牌”之间摇摆。最终裁决是：

> **做公共地球，但借用卡牌的形作为物件层——地球是棋盘，卡片是棋子。**

卡牌真正有用的部分是清晰的物件边界、正反面信息、收藏册式浏览和身份表达；应当舍弃的是稀有度、开卡包、随机抽取、对战和价格炒作。

# 8. 公共知识系统

## 8.1 一个 Harness，八个领域子 Agent

公共新闻系统不是一个全能 Agent，也不是八套复制代码，而是：

> **一个共享 Knowledge Scout Harness + 八个领域配置子 Agent。**

八个领域分别是 AI、科技、金融、气候、科学、健康生命、文化、政策社会。每个子 Agent 只声明检索意图、来源偏好、关键词、时效要求和角色；检索、去重、预算、交叉核验、评分、审计和版次生成复用同一内核。

这样设计的原因是：领域来源和新闻节奏不同，需要专业化；但工程护栏相同，不应复制。某一领域来源失败时只隔离该领域，不拖垮整轮日更。

## 8.2 自动日更管线

生产环境由 Node worker 和 PM2 守护，不额外创建 Python 定时脚本。默认每日 UTC 00:10（北京时间 08:10）运行：

1. 读取八领域配置。
2. 通过 RSS/搜索发现线索。
3. 过滤过期、主题不相关、来源不透明和重复信号。
4. 聚焦到固定预算内的候选。
5. 搜集直接来源；聚合页只做发现入口，不做最终证据。
6. 调查方整理支持证据。
7. 质疑方寻找反例、冲突和证据缺口。
8. 确定性公式计算 truthScore。
9. 写入七日热缓存，状态为 `draft_review_required`。
10. 人工审核通过后，显式生成版次并提交 Injective。

Worker 不读取 Injective 私钥，也不自动写链。自动发现和判断可以无人值守；公开承诺必须经过人工批准和显式提交。

## 8.3 真实新闻原则

公共知识页面必须使用真实、有意义、能吸引人继续阅读的新闻，禁止为了填 UI 编造标题、来源和事实。候选至少满足：

- 在时间窗口内。
- 与主题配置明确相关。
- 最终证据来自可直接访问的来源页面。
- 至少两个独立发布域名；同一媒体转载不算两份证据。
- 摘要不能超出来源支持范围。
- 无法确认时保留候选状态，不进入 Merkle 版次。

离线演示卡可以使用带真实官方来源的策展样例，但必须标成 OFFLINE/SAMPLE；只有真实 worker trace 才能标为 LIVE。

## 8.4 知识冷热分层

| 层级 | 保存内容 | 生命周期 | 当前实现 |
|---|---|---|---|
| L1 工作记忆 | 当前运行信号、调用状态、预算计数器 | 进程内易失 | 已实现 |
| L2 七日热缓存 | 全部候选、模型核验、失败原因、Harness trace、当日草稿 | 默认 7 个 UTC 日历日 | `var/knowledge/YYYY-MM-DD/*.json` 原子写入 |
| L3 长期精选 | 人工批准主张、最终来源、recordHash、Merkle proof、editionRoot、交易 | 永久 | `var/knowledge/editions/` + Injective root |

超过七天后，完整新闻工作区、失败搜索和模型草稿会被安全清理；已经批准并进入版次的精选知识继续长期保留。清理器只删除符合严格日期格式的顶层目录，永不删除 `editions/`、状态文件和配置。

当前实现使用原子 JSON 文件和目录分层，而不是 MySQL/SQLite。传统数据库未来可以作为高并发查询或全文检索的实现替换，但不能替代公开 Merkle 证明；数据库解决“如何查”，Injective 解决“如何证明这个版本曾经存在”。

## 8.5 ClaimKey、recordHash 与 Merkle

公共知识使用两种不同哈希：

- **ClaimKey**：同一语义主张的稳定身份，用于跨来源去重和把更正关联到原主张。
- **recordHash**：标题、正文、来源、日期、评分等精确快照的哈希；任何字段改变都会得到新哈希。

每条批准记录成为 Merkle 叶子；所有叶子生成当天 editionRoot。资源包包含记录和 inclusion proof，客户端可本地完成：

1. 重新计算 recordHash。
2. 沿 proof 路径计算根。
3. 读取 Injective 上对应日期/revision 的 editionRoot。
4. 比较两者是否一致。

当前 revision 2 使用 `fact-atlas-daily-edition/v1` 的单棵每日树以保持兼容。未来若采用“一主题一棵子树、一天一个总根”，必须发布新 schema，不能改写旧版。

## 8.6 为什么叫“每日知识版次”，不叫“一天一个区块”

早期构想希望把每天不同领域的知识做成一个“区块”，一天接一天形成不可更改的公共知识链。这个直觉抓住了“批次、时间、历史不可覆盖”，但直接称为区块会造成“项目自己造了一条链”的误解。

最终采用“每日知识版次”：Pocket Earth 在应用层组织内容、生成 Merkle root，再把 root 提交给 Injective。共识和最终性由 Injective 提供，Pocket Earth 不自建 PoW、不自建 PBFT，也不让用户成为验证节点。

## 8.7 与 FactAtlas 的关系

公共知识版次复用了开发者自己此前 FactAtlas 项目的验证思想与 Chronicle 内核，并把后端能力搬入 Pocket Earth：

- 保留多来源证据、调查/质疑、确定性评分、Merkle 版次和 proof API。
- UI 完全适配 Pocket Earth 的像素/纸张/地图语言。
- Public Earth 用地点便签而不是原项目的信息流界面。
- 复用属于开发者自己的代码与作品，不是依赖外部未授权资产。

# 9. Injective 公共见证层

## 9.1 Injective 能否运行智能合约

可以。Injective 官方 EVM 文档说明，开发者可以使用 Solidity 与常见工具编译、测试、部署、验证并调用智能合约；测试网 EVM Chain ID 为 `1439`。[S2][S3]

Pocket Earth 选择 Injective EVM，是因为项目已经拥有 Solidity/viem 工具链，并且决赛需要让身份、门牌、握手和知识版次形成可以由评委直接在 Blockscout 核验的证据。

## 9.2 为什么不只做“链上身份”

只有身份注册，区块链仍然像一个徽章。Pocket Earth 更深的用法是把链上确定性与链下概率性配对：

- Agent 的推理、新闻筛选、文本生成和地图交互留在链下。
- 身份、门牌承诺、版次根和公开事件写入 Injective。
- 评委可以从产品 UI 一路追溯到 API、交易、事件和合约地址。

区块链不负责替 Agent 思考，而负责回答：这个身份是否存在、这个卡面是否匹配、这个知识版本是否在某时刻被提交、这个公开握手是否真的发生。

## 9.3 当前四组真实链上证据

| 能力 | 当前证据 | 状态 |
|---|---|---|
| ERC-8004 身份 | IdentityRegistry `0x8004…BD9e`；agentId `43–47` | Injective testnet 已验证 |
| 公共地球门牌 | PublicEarthRegistry `0xac7c…ee1b`；五个象征性 residence | Injective testnet 已验证 |
| 公共知识版次 | DailyKnowledgeChronicle `0x3f0e…0c25`；20260717 revision 2 | Injective testnet 已验证 |
| Agent 公开握手 | SocialHandshake `0xe533…3aee`；43↔44，score 88 | Injective testnet 已验证 |

截至 2026-07-18，核心 live verification 已再次通过：Public Earth 合约读取到 5 个 residence；Chronicle 读取到 revision 2；下载包的两条记录可以自验证并匹配链上根；ERC-8004 身份、钱包时间线、握手 calldata/event 与 Blockscout 页面可公开核对。

## 9.4 ERC-8004 身份

Frost 主身份为 agentId `43`，公开 owner/wallet 为 `0x6D5A…C934`，builderCode 为 `pocket-earth`。agentId `44–47` 分别代表拉美文学、黑色电影、爵士与北欧极光等公开口味分身。

身份注册表是 ERC-721 形态，实测可转让；没有实现不可转让接口。因此正确口径是：

- 持久、公开可验证、可审计的 Agent 身份。
- 不称 soulbound。
- 不把 token 的当前持有人与历史信誉混为一谈。
- 身份卡是 Agent 的身份证，不等于 Agent 代码、版权、服务许可或私人记忆。

## 9.5 PublicEarthRegistry

PublicEarthRegistry 保存公开 Agent 的象征性分区、门牌、卡面承诺与 revision。Frost #43 的门牌为 `PE-03-0043`。门牌解决“在公共地球中如何命名和定位一个分身”，但它不是现实地址、虚拟土地或地块所有权。

地图坐标可由 agentId 确定性映射，以保证刷新后位置稳定；链上只需保存足以验证身份与卡面的字段，不保存高频渲染状态。

## 9.6 DailyKnowledgeChronicle

当前合约地址为 `0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25`。已验证版次：

- day：`20260717`
- revision：`2`
- factCount：`2`
- editionRoot：`0x6e62dcc3fe00495d15d2a7600a5dff6a9f396b85f641fd5316ff69b8327491da`
- transaction：`0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7`

合约保存每日版次根与修订关系，不保存新闻全文。任何修订都产生新的 revision；旧 root 不被覆盖。

## 9.7 SocialHandshake

SocialHandshake 已部署在 `0xe5338a162a44a685201e1f6120b1a851949e3aee`。真实握手记录为：agentA `43`、agentB `44`、score `88`，两侧 profileHash 均为非零 bytes32。它证明一次公开 Agent 相遇发生过，不证明两个人的私人资料，也不把相似度变成代币价格。

## 9.8 为什么不自建 PBFT

早期讨论曾考虑为每日知识块设计轻量 PBFT，避免 PoW 的高成本。最终不采用，原因是：

- 自建共识会把产品变成新的区块链项目，扩大攻击面和维护成本。
- 少量自选节点的 PBFT 容易退化为项目方自己给自己签字。
- Injective 已提供成熟网络共识与最终性；应用只需提交版次根。
- 评委关心的是产品如何使用 Injective，而不是 Pocket Earth 再造一层共识。

正确表达是：Pocket Earth 生成应用层每日版次，Injective 负责公共最终性。

## 9.9 Gas 与用户体验

公共地球不把每条新闻、每次缩放和每张卡片写链。每天一次总根提交把成本压缩到常数级；浏览、下载与验证都是只读操作，不要求普通用户为查看知识发交易。服务端或版次发布者承担显式写链，用户不感知 gas。

# 10. Frost 身份卡、NFT 思想与品牌系统

## 10.1 NFT 的思想仍有用，但价值锚需要改变

NFT 是描述唯一数字对象、身份、权利或凭证的一类技术形态；“数字藏品”只是其中一种产品化用法。RWA 可以使用 NFT 表示某件唯一资产或凭证，但并非所有 RWA 都必须是 NFT。

经历 PFP、限量稀缺与价格投机退潮后，仍然有长期价值的方向是身份、来源、访问权益、游戏物件、版权/许可和真实资产凭证。Pocket Earth 吸收的是“唯一身份和可验证来源”，不是“人为制造稀缺”。

## 10.2 Frost 身份卡的正确定位

Frost 身份卡可以具有 NFT 式的鲜明视觉，但其价值来自：

- 对应一个真实 agentId。
- 对应一个公开门牌与 cardHash。
- 对应后续真实服务、握手和公开贡献记录。
- 可以从 App、公共地球和 Blockscout 交叉核对。

它不设置稀有度、卡包、对战或升值承诺。卡片记录事实，不制造稀缺。

## 10.3 地球是棋盘，卡片是棋子

如果只做卡牌，产品容易偏离 Pocket Earth 的空间基因；如果只做地球，公开身份又缺少可触摸的物件感。最终组合是：

- Public Earth 提供世界、空间关系、街区和门牌。
- 身份卡回答“我是谁”。
- 门牌回答“我在哪”。
- 知识卡记录“我在这里发现了什么”。
- 相遇卡记录“我和谁发生过一次公开握手”。
- 明信片记录“夜里我从公共地球带回了什么”。

## 10.4 Frost 五张现有身份图

- #43 FROST Core：主身份与平台中心角色。
- #44 Literature：拉美文学旅人。
- #45 Noir：黑色电影迷。
- #46 Jazz：爵士夜行者。
- #47 Aurora：北欧极光客。

它们共享方头、正面视角和核心眼神，环境、颜色与细节略有变化。未来个体化应由用户主动公开的脱敏标签确定性生成，而不是读取私人记忆原文。

## 10.5 品牌启发

鲜明形象的价值不是“有一张好看的图”，而是“一致性 × 分发 × 时间”。Frost 的优势在于形象与功能同构：一台想理解人类的机器，正好是替用户整理人生的 Agent。统一轮廓提供品牌识别，个人细节提供情感归属。

## 10.6 硬件不是收藏品

树莓派和 Whisplay 是量产开发硬件，本身没有传统收藏品的底层稀缺价值。人为限量、稀有度和升值叙事会重走投机路线。硬件更正确的定位是：

1. 公开 Agent 身份的物理载体。
2. 未来设备批次、保修与绑定身份的出厂凭证。
3. Agent 服务的访问入口。

一句话：

> **硬件的价值不在盒子稀缺，而在盒子里住着谁。**

# 11. Frost Edge Node 实体终端

## 11.1 产品定位

Frost Edge Node 让 Frost 从屏幕走到桌面。它是体验差异化、开发套件和公开事件端点，不是当前量产收入支柱。真实硬件为 Raspberry Pi 5 + Whisplay HAT，拥有 240×280 屏幕、麦克风、扬声器、按键与 RGB LED。

当前已实现并通过仓库验证的物理能力包括：Whisplay 显示、RGB LED、本地 MiniMax TTS、离线 espeak 兜底、手机镜像、systemd 服务与 replay cursor。BLE、MQTT 和 serial 仍是可选 transport，不是主链路依赖。

## 11.2 Linux 目录决策

用户最终选择“结构清晰胜过标准部署目录”。项目在 `/home/pi` 下平行存在：

- `/home/pi/sunset-radio`
- `/home/pi/pocket-earth`

Pocket Earth 内部子 Agent 再作为平行分支。配置、持久状态和运行态仍可分离到：

- `/etc/pocket-earth-edge.env`
- `/var/lib/pocket-earth-edge`
- `/var/cache/pocket-earth-edge`
- `/run/pocket-earth-edge`

`/opt` 更符合传统系统级软件安装习惯，但当前设备首先是一台可理解、可现场演示的个人原型，因此项目树放在 `/home/pi` 更符合使用者心智。

## 11.3 最外层启动器

最外层标题为“口袋地球”，包含三个平行项目：

- **日落电台**
- **口袋播客**
- **地球答案**

统一按键规则：

- 单击：移动选择或翻到下一项。
- 长按 1.2 秒：进入、确认或打开。
- 快速双击：返回上一级。

启动器必须拦截厂商 Whisplay 的 Bluetooth、Wi‑Fi 和示例 App，用户不能因为误触落入无法返回的厂商界面。项目 launcher 与 desktop guard 负责抢回屏幕焦点，并在退出时恢复必要资源。

## 11.4 日落电台

日落电台保留原项目的音乐能力，但在 Pocket Earth 启动器中提供三个清晰模式：

1. **歌曲目录**：直接列出歌曲，不再先进入 UTC 分组层级；选中后明确显示曲名、艺人和播放提示。
2. **日落时刻**：根据此刻全球日落城市选择相应音乐，进入后显示城市、倒计时和曲目。
3. **随机骰子**：复用桌面端骰子视觉；先滚动骰子，再落到一首歌，用户显式确认后才播放。

在图书馆、比赛候场等安静环境中，默认不自动播放。音频动作必须由用户确认，并支持静音/耳机输出。

## 11.5 口袋播客

口袋播客把每日知识版次转化为两种使用方式：

- **播客模式**：Agent 把当天精选知识组织成适合听觉的串联稿，而不是把卡片逐字朗读；TTS 播放，屏幕显示当前主题与版次。
- **阅读模式**：保留现有八领域分类和可验证知识卡，可翻阅三天或七天缓存，并查看来源与版次状态。

当前真机缓存已经包含 revision 2 的示例知识卡和播客预览；完整“自动生成播客语言”仍需要在真实日更数据上继续优化。

## 11.6 地球答案

地球答案是一个独立的每日行动指导 Agent，借鉴日历产品的仪式感，但适配 Pocket Earth 的像素/纸张语言：

- 全年 365 条经过整理的古典哲学原句与作者。
- 每天 00:00 才解锁当天答案，不能提前偷看未来。
- 可以向前翻阅过去答案。
- 第一次打开当天答案时先出现骰子滚动，再揭晓日期、原句与作者。
- 作者名位于页面底部居中，不带破折号。
- 引文主体优先使用大字号，保证 240×280 小屏可读。

当前 `earth_answers_365.json` 已包含 365 条经过审阅的条目，状态机与 smoke test 已通过。另有 31 条 Pocket Earth 原创 decision prompts 用于静默首页/今日一页，与哲学引文库分开，不能混称原著引文。

## 11.7 静默首页

设备闲置时不应回到厂商菜单，而应显示 Pocket Earth 的静默画面：时间、日期、连接状态、一句克制提示或“今日一页”。它既像桌面时钟，也维持 Frost 的房间存在感。需要播报时再从静默状态切换到知识卡、身份卡或音乐卡。

## 11.8 公开事件桥

硬件链路为：

1. Pocket Earth 服务端从 Injective 读取公开证据。
2. 服务端生成白名单 JSONL envelope。
3. `/api/frost-feed` 通过设备 token 暴露事件流。
4. Pi sidecar 使用 cursor 防止重播。
5. event adapter 只生成 `state / display / tts` 动作。
6. 物理 driver 驱动屏幕、LED 与 TTS。

`speak` 必须由服务端模板生成，设备不朗读任意链上文本。硬件不持有私钥、不签名、不读取私人画像、照片、心情或精确坐标。

## 11.9 决赛硬件演示

现场主场景是：在产品端触发或读取一次公开链上见闻，三秒内 Frost Edge Node LED 改色、小屏出现证据卡、TTS 读出一句“链上见闻”，手机镜像同步到大屏。备份录像与静态证据卡必须提前准备；不把语音唤醒作为必需路径。

演示金句：

> **白天，Frost 以链上身份去公共地球；夜里，它把经过验证的世界带回房间。**

# 12. Microsoft Foundry 与端云双脑

## 12.1 端侧管“挑和找”，云端管“写”

Pocket Earth 的端云双脑不是把所有任务都交给最大模型：

- 端侧 Selector 负责意图分类、排序、过滤、嵌入检索与隐私敏感视觉。
- 云端 Brain 负责叙事、综合、推荐理由和长文本生成。
- 确定性规则承担边界校验、停止条件和无模型兜底。

## 12.2 Microsoft Foundry Model Router 的角色

Microsoft 官方文档将 Model Router 描述为一个可部署的单一聊天模型入口，它可以实时选择合适的底层模型，并通过 Chat Completions API 像调用单一模型一样使用。[S4]

Pocket Earth 的接入方式是：

- `provider-compat` 保持统一请求/响应契约。
- Microsoft Foundry Model Router 作为云端首选路由。
- Qwen 保留为 fallback。
- 规则兜底作为最终路径。
- RunTrace 记录实际 provider、模型和降级原因，但不泄露密钥。

## 12.3 为什么 Azure 不写进主定位句

Injective 解决公开信任，Microsoft Foundry 解决模型基础设施。两者都重要，但不属于同一层。Injective 决赛的主角必须是 Pocket Earth 如何使用 Injective；Azure 放在架构页和 Microsoft 评委问答中，作为端云双脑、成本控制和容灾的加分项。

## 12.4 当前状态

- Azure provider adapter 已进入统一 provider 层。
- `verify:foundry-provider` 离线契约测试已通过。
- `.env.example` 与严格真实请求脚本已完成。
- 当前真实账号尚未配置，`verify:foundry-live` 明确显示缺少 endpoint、key 与 deployment。
- 决策：先完成 PPT，再购买/配置 Azure 账号，部署 Model Router，运行 `verify:foundry-live:strict`。

只有严格命令获得真实 HTTP 2xx、provider、model 和 Azure request id 后，技术证据页才展示真实响应。最终 PPT 可按目标完成态设计，但上台前必须完成这道验收。

# 13. 隐私、安全与可验证性

## 13.1 四层数据边界

| 数据类型 | 端侧 | 服务器/资源包 | Injective | Frost Edge Node |
|---|---|---|---|---|
| 原始照片、票据、证件、人脸 | 保留/处理 | 默认不上传 | 禁止 | 禁止 |
| 私人书影音原文、心情、精确位置 | 保留 | 仅必要派生字段 | 禁止 | 禁止 |
| 脱敏公开标签 | 用户确认后可导出 | 可形成公开名片 | cardHash/公开字段 | 只读必要展示 |
| 公共新闻正文与来源 | 可缓存 | 进入资源包 | 只存 editionRoot | 可播报服务端摘要 |
| Agent 身份、门牌、公开握手 | 可显示 | 只读 API | 保存公开事实 | 可显示/播报 |
| 私钥、助记词、server env | 禁止进入 UI | 仅安全服务器环境 | 不公开 | 严格禁止 |

## 13.2 写链原则

所有写链路径遵循 `suggest → confirm → sign`。没有显式 `confirm:true` 和安全配置时只返回 dry run；硬件永远不参与签名。

## 13.3 可验证不等于公开一切

哈希不是内容容器。链上哈希只能证明某个承诺与某个版本匹配，不能替用户公开原始人生。正确边界是“把可验证交给链，把隐私留在端”。

# 14. SocialFi、NFT 与代币化模式的取舍

## 14.1 SocialFi 的诊断对，处方错

相关书籍正确指出了围墙花园、数据不可携带、平台激励错位和用户缺乏控制权；但“发社交代币、粉丝持币才能互动、影响力上涨带动币价”的处方被市场证明风险极高。

Pocket Earth 的取舍是：

- 社交只做 Agent 的发现与分发层。
- 身份价值来自真实记录，而不是交易价格。
- 用户与 Frost 互动不需要持币。
- 声誉由真实服务、版次和公开事件累积，不能直接购买。
- 不发行治理代币、实用代币或社交代币。

内部总结句：

> **书写对了诊断，写错了处方，市场替我们跑完了实验。**

## 14.2 取需求，换实现

讨论中形成了一套稳定方法：从曾经流行但失效的模式中取出真实需求，再换成不可炒作的实现。

- 影响力变现 → 真实 Agent 服务与长期贡献。
- 身份表达 → 由公开标签生成的 Frost 形象。
- 社区归属 → 公共地球的门牌、街区和相遇。
- 信用 → 可核对的身份、版本、握手和服务记录。
- 数字收藏 → 记录真实事实的身份卡、知识卡和明信片。
- 虚拟土地 → 非现实地址、非产权的象征性空间命名。

## 14.3 决赛为何不提付费

虽然长期 Agent 平台可以探索订阅、调用与服务回执，但决赛主叙事已经明确不提付费。原因不是付费机制没有价值，而是：

- 当前最强证据是身份、门牌、知识版次和硬件闭环。
- 付费会把注意力从 Injective 的公开见证能力拉向未完成的商业模型。
- 代币、SocialFi 和 NFT 投机语境容易引发错误联想。
- 一周冲刺应优先把真实闭环做深，而不是同时证明收入。

# 15. UI 与视觉系统

## 15.1 总体风格

Pocket Earth 使用像素标题、粗黑边框、纸张卡片、柔和地图和 Injective 绿色高光。它既有数字设备感，又保留旅行手帐、便签和收藏册的触感。

## 15.2 公共知识地图

- 使用浅色 Mapbox 底图。
- 国境线细、地点文字克制。
- 八主题使用柔和但可区分的颜色。
- 便签比圆点更重要；缩放后显示纸张卡。
- 新闻详情支持同主题左右箭头切换。
- 点击缩略卡展开完整内容，形成正常手机阅读体验。

## 15.3 身份卡

- 五张卡横向牌组，#43 为主卡。
- 左右箭头必须显式可见，不只依赖手势。
- 图像更正面、透视更小，避免方形头部被误读为身体。
- 卡面同时显示 agentId、门牌、公开标签、revision 与 Injective verified。

## 15.4 PPT 视觉结论

最终决赛 PPT 不再以大量可编辑对象搭版，而是每页 4K 整体渲染，再按顺序装入 PPTX。标准内容页沿用“左文、右双截图、浅灰网格、三角标注”；架构页沿用浅色分层框图；硬件页沿用真机对照和功能拆解，但硬件造型必须使用真实 Frost Edge Node。

# 16. 当前实现状态

## 16.1 已实现并有验证

- 私人空间知识库、地图联动、Photos 三视图与多领域 Agent。
- Frost Agent Harness、skill 路由、Agent Forge/Plaza 安装闭环。
- Public Earth 三视图与 Mapbox 公共知识便签。
- Frost #43–47 ERC-8004 链上身份。
- PublicEarthRegistry 五个象征性 residence。
- SocialHandshake 真实 43↔44 / score 88 交易。
- DailyKnowledgeChronicle revision 2 与可下载验证包。
- 八领域共享 Knowledge Scout Harness。
- 七日热缓存、安全清理与永久精选档案。
- Frost Edge Node JSONL 事件桥、token、cursor、防重播、Whisplay、LED、TTS、手机镜像与 systemd。
- 日落电台三个模式、口袋播客界面、地球答案 365 条状态机。
- 决赛域名 DNS 已指向服务器。
- Azure provider adapter 与离线契约验证。

## 16.2 赛前仍需最终验收

- Azure 真实账号、Model Router 部署和 strict live verification。
- 决赛渲染版 PPT 全部页面、口播与分镜。
- 最终线上域名部署后的手机真机回归。
- 公共知识八领域真实日更的生产数据质量与管理员审核流程。
- 软件到真机硬件的最终公开链上见闻彩排与备份录像。
- 比赛当天网络、TTS、音量、手机镜像与断网降级预检。

## 16.3 长期方向

- 更多空间原生 Agent 与跨客户端验证包阅读器。
- 由用户主动公开标签生成跨端 Frost 个体形象。
- 一主题一棵子树、一天一个总根的新知识 schema。
- 更自然的每日知识播客编排。
- 公开贡献与服务记录驱动的 Profile Confidence。
- 设备出厂记录、身份绑定与访问权益凭证。

# 17. 决赛叙事

## 17.1 一句话

Pocket Earth 是空间 Agent 平台：私人记忆留在自己的地球，公共 Agent 与知识版次由 Injective 公开见证；Frost 再把这些公开见闻带到房间里的实体终端。

## 17.2 15 页主 Deck

1. Pocket Earth on Injective 封面。
2. AI 时代的记忆碎片与信息过剩。
3. 一颗地球、三层系统。
4. 私人地球：空间记忆。
5. Agent Forge / Plaza 平台闭环。
6. Public Earth 知识地图。
7. 八领域知识 Agent 管线。
8. 七日热缓存与 Merkle 长期记忆。
9. 为什么必须使用 Injective。
10. 四组真实链上证据。
11. Frost 链上身份卡与统一形象。
12. Microsoft Foundry Model Router 架构。
13. Frost Edge Node 实体 Agent。
14. 从公开知识到硬件播报的 60 秒闭环。
15. 收束与公开核验入口。

## 17.3 60 秒产品闭环

1. 八领域 Agent 找到真实公共信号并交叉核验。
2. 通过门槛的知识进入当天资源包，生成 recordHash 与 Merkle proof。
3. 每日 editionRoot 提交 Injective。
4. Public Earth 把知识便签显示在地图上。
5. 用户点开缩略卡，展开来源与 proof。
6. Frost #43 读取公开事件。
7. Frost Edge Node 亮灯、显示并播报链上见闻。

## 17.4 现场必须能独立核对的证据

- Frost #43 身份页。
- owner 钱包与七笔时间线。
- PublicEarthRegistry 合约与 #43 门牌交易。
- DailyKnowledgeChronicle 合约与 revision 2 交易。
- SocialHandshake 合约与真实握手交易。
- `/api/injective?tool=get-chain-evidence`。
- `/api/knowledge?tool=pack&date=2026-07-17`。
- `/api/injective?tool=get-hardware-bridge-proof`。

# 18. 口径红线

1. **只讲 Injective**：决赛主讲不引入其他链名。
2. **不把 Agent 叫智能合约**：只说平台发布/发现/调用逻辑相似。
3. **不说 soulbound**：ERC-8004 身份实测可转让。
4. **不说知识正文上链**：内容在包里，链上只有根与 revision。
5. **不说一天一个区块**：统一使用“每日知识版次”。
6. **不说自建 PBFT/自建链**：共识由 Injective 提供。
7. **不说虚拟土地**：门牌是象征性空间身份，不是产权。
8. **不说卡牌游戏**：无稀有度、卡包、对战和升值。
9. **不发币**：不讲治理代币、实用代币或社交代币。
10. **决赛不提付费**：不讲订阅、抽成、支付或收入。
11. **不把硬件说成量产产品**：定位为实体 Agent 原型与开发套件。
12. **不让硬件持密钥**：设备只消费公开事件。
13. **Azure 不冒充已真实验收**：strict live 成功后才展示真实响应证据。
14. **不把策展样例说成实时核验**：OFFLINE 与 LIVE 明确区分。
15. **不引用未经核实的官方定位**：所有外部事实回到官方文档或公开交易。

# 19. 决策备忘录

## 19.1 已确定的核心决策

- Pocket Earth 同时拥有私人空间知识库与公共 Agent 平台两层。
- 公共知识地球渲染在手机 App，不把整个地球放链上。
- 知识以每日版次锚定，不自建区块链和 PBFT。
- Public Earth 选择“地球为骨、卡为皮”，不二选一。
- Frost 卡片借 NFT 的身份/来源思想，不借投机经济学。
- 硬件是身份与访问权益的物理载体，不是收藏品。
- 社交只做 Agent 分发与发现，不发社交代币。
- Agent Plaza 聚焦知识管理、内容创作和空间体验。
- 决赛不讲付费，先证明完整产品与公开证据。
- Azure 是模型基础设施加分项，Injective 是主叙事。
- 软件、链上与硬件通过事件合同解耦；真机故障不拖垮 App。

## 19.2 被否决或延后的方向

- 自建 PBFT 知识链。
- 把每条新闻全文写入链上。
- 虚拟地块交易与现实地址绑定。
- 卡牌对战、开包和稀有度。
- 商品硬件限量收藏与升值叙事。
- 决赛中的付费订阅、平台抽成和结算回执。
- 用代币代表 Frost 影响力。
- 把 Azure 写进项目主定位句。

# 20. 验收清单

## 20.1 软件

- Private Map 与 Public Earth 顶部切换清晰。
- Public Earth 三子视图互不挤压。
- 地图国境线细，知识便签清晰，详情可展开。
- 身份卡左右箭头、点击证明路径可用。
- 八主题真实数据不混入编造样例。
- 七日清理不会删除 editions。
- 下载包可以离线验证并匹配 Chronicle。

## 20.2 链上

- `verify:chronicle-live` 通过。
- `verify:public-earth-live` 通过。
- `verify:knowledge-pack` 通过。
- 身份、钱包、握手、合约与交易链接可访问。
- 聚合验证套件最终全部通过；文字守门失败也必须修复，不能以“链上没问题”跳过。

## 20.3 Azure

- 创建 Foundry 资源与 model-router 部署。
- `.env` 仅在服务器/本机安全配置。
- `verify:foundry-live:strict` 返回真实成功。
- 日志不打印 endpoint、key 或完整原始响应。
- 主路由失败时回落路径可演示。

## 20.4 硬件

- 启动后直接进入 Pocket Earth launcher，不出现厂商 Bluetooth/Wi‑Fi 菜单。
- 单击移动、长按 1.2 秒进入、双击返回在所有层级一致。
- 屏幕中文无方块、无截断、作者位置正确。
- LED、display、TTS、手机镜像与 cursor 正常。
- 音频输出、静音与安静场景行为符合现场要求。
- 公开 chain dispatch 不包含隐私字段。
- 现场备份录像可无网播放。

## 20.5 PPT 与演讲

- 所有页面按 4K 整体渲染并在 16:9 检查。
- Injective 在第一分钟出现，Azure 不稀释主线。
- 地址与数字与最新证据文件一致。
- 所有“已完成”均有代码、API、交易或真机证据。
- 现场口播不触发十五条红线。

# 21. 附录 A：关键地址与入口

| 名称 | 地址/入口 |
|---|---|
| IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| Frost 主身份 | agentId `43` |
| Pocket Earth fleet | agentId `43–47` |
| Owner wallet | `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934` |
| SocialHandshake | `0xe5338a162a44a685201e1f6120b1a851949e3aee` |
| PublicEarthRegistry | `0xac7cbe6ee92298487d4349b54e2b2c876232ee1b` |
| DailyKnowledgeChronicle | `0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25` |
| Chronicle revision 2 tx | `0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7` |
| 公开证据 API | `/api/injective?tool=get-chain-evidence` |
| Public Earth API | `/api/injective?tool=get-public-earth` |
| Knowledge pack | `/api/knowledge?tool=pack&date=2026-07-17` |
| Hardware proof | `/api/injective?tool=get-hardware-bridge-proof` |

# 22. 附录 B：核心验证命令

```text
npm run verify:foundry-provider
npm run verify:foundry-live:strict
npm run verify:knowledge-agent-harness
npm run verify:knowledge-worker
npm run verify:knowledge-api
npm run verify:knowledge-pack
npm run verify:chronicle-live
npm run verify:public-earth-live
npm run verify:hardware
npm run verify:injective
```

# 23. 附录 C：资料来源

## 23.1 项目内部权威资料

- [L1] `ARCHITECTURE.md`：当前总体代码架构与记忆分层。
- [L2] `knowledge/README.md`：八领域 Knowledge Scout Harness、七日热缓存与永久精选层。
- [L3] `INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md`：公开链上证据、交易时间线与验证命令。
- [L4] `INJECTIVE-INTEGRATION/PITCH-NOTES.md`：决赛主叙事与口径边界。
- [L5] `决赛作战手册-2026-07-17.md`：五轮调研与红队审查后的执行结论。
- [L6] `链上身份与公共地球-叙事定稿-2026-07-17.md`：身份三层、Public Earth、Frost 品牌与卡片边界。
- [L7] `公共地球与知识分发-Codex交接文档-2026-07-17.md`：Web3 知识分发、资源包与 Merkle 证明。
- [L8] `hardware/frost-buddy/`：公开事件桥、Pi adapter、真机 driver 与 Linux 布局。
- [L9] `决赛提交的PPT/Injective决赛渲染版/outline.md`：最新 15 页主 Deck 与 7 页答辩页。

## 23.2 外部公开资料

- [S1] The Guardian, “Data isn’t oil…”：转述 Clive Humby 的“Data is the new oil”及“未经提炼无法使用”的完整含义。https://www.theguardian.com/commentisfree/2021/may/29/data-oil-metaphor-tech-companies-surveillance-capitalism
- [S2] Injective Docs, EVM Network Information：Injective EVM 测试网 Chain ID 1439、RPC 与 Blockscout。https://docs.injective.network/developers-evm/network-information
- [S3] Injective Docs, Your First EVM Smart Contract：Solidity 合约的编译、部署、验证和调用。https://docs.injective.network/developers-evm/smart-contracts
- [S4] Microsoft Learn, How to use model router for Microsoft Foundry：Model Router 单一部署入口与实时模型选择。https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/model-router

# 24. 最终结论

Pocket Earth 的真正独特之处，不是把地图、Agent、区块链和硬件堆在一起，而是给四者划定了清晰分工：

- 地图负责把记忆与公共知识放回空间。
- Agent 负责感知、筛选、整理、创作和行动。
- Injective 负责让身份、门牌、版本和公开事件成为可核对事实。
- Frost Edge Node 负责让这些公开事实在现实房间里被看见、听见和记住。

私人生活不因上链而被公开，公共知识不因平台消失而失去证明，模型不因切换而改变 Agent 身份，硬件不因有了身体而获得越权。

这套边界最终收束为三句话：

> **口袋地球装记忆，公共地球住分身。**  
> **渲染在端上，内容在包里，指纹在链上。**  
> **趁生命气息逗留，把世界钉回它该在的地方。**

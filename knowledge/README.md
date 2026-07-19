# Knowledge Scout Harness

Pocket Earth 的自动新闻系统不是一个全能 Agent，也不是八套复制代码，而是：

> **一个共享 Knowledge Scout Harness + 八个领域子 Agent 配置。**

八个子 Agent 分别负责 AI、科技、金融、气候、科学、健康生命、文化、政策社会。每个子 Agent 只声明自己的检索意图、偏好来源与角色；检索、去重、聚焦、交叉核验、确定性评分、审计和 Merkle 版次全部复用同一内核。

这一结构吸收了黄佳老师《Agent 设计模式：图解可复用智能体架构》的感知/记忆/推理/行动/反思/协作六轴，以及《Claude Code 实战：Harness 工程之道》的记忆、扩展、集成、编程四层工程方法。落到本项目后，核心原则是：**概率 Agent 负责寻找与判断候选，确定性 Harness 负责预算、权限、状态、验证与停止。**

## 架构

```text
PM2 daily trigger (00:10 UTC)
        │
        ▼
Knowledge Worker ─────────────── 7-day hot cache
        │                         candidates / traces / failures
        ├─ AI Scout
        ├─ Technology Scout
        ├─ Finance Scout
        ├─ Climate Scout
        ├─ Science Scout
        ├─ Health Scout
        ├─ Culture Scout
        └─ Policy Scout
                 │
                 ▼
Shared Harness pipeline
plan → active perception → attention focus → evidence scout
     → source guard → investigator + skeptic → deterministic judge
     → receipt keeper → human review gate
                 │
                 ├─ rejected / draft: never written on-chain
                 │
                 └─ human approved + explicit commit
                              │
                              ├─ Injective edition root
                              └─ permanent compact archive
```

### 四层映射

| Harness 层 | Pocket Earth 实现 |
|---|---|
| 记忆 | L1 单次工作记忆、L2 七日短期缓存、L3 长期精选版次档案 |
| 扩展 | 八个领域配置、调查方、质疑方、确定性裁决和人工闸门 |
| 集成 | Google/Bing RSS 发现、直接来源、模型 Provider、Injective Chronicle |
| 编程 | `agent-harness.mjs`、Knowledge API、PM2 Headless Worker |

## 为什么是八个子 Agent

- 领域之间查询词、权威来源和新闻节奏不同，需要专业化配置。
- 八个领域互相独立，某个来源失效不会拖垮整轮日更，符合舱壁隔离。
- 它们不需要八套实现；新领域只注册配置，不改共享 Harness。
- 领域任务可并行演进，但单个领域内部严格走有先后依赖的流水线。

## 证据与模型边界

1. RSS 聚合器只用于发现线索，Google News/Bing 搜索页不能成为最终证据。
2. 候选先经过新鲜度、主题相关度、来源偏好与重复度聚焦，减少模型上下文噪声。
3. 一条知识至少需要两个独立发布域名；同一媒体的转载不会被当成两份证据。
4. 调查方和质疑方独立审阅，确定性公式计算 Truth Score。
5. 每轮有固定的信号数、证据调用数和核验数上限；预算耗尽立即停止。
6. 自动输出一律标记为 `draft_review_required`。Worker 不读取 Injective 私钥，也不自动提交交易。

## 七日热缓存与永久精选层

两层数据不能混为一谈：

| 层 | 保存内容 | 生命周期 |
|---|---|---|
| L1 工作记忆 | 当前一次运行中的信号、调用状态和计数器 | 进程内、易失 |
| L2 短期缓存 `var/knowledge/YYYY-MM-DD/` | 全部候选、模型核验结果、失败原因、Harness 轨迹、当日草稿 | 默认 7 个 UTC 日历日 |
| L3 长期记忆 `var/knowledge/editions/` | 人工批准的主张、最终来源、recordHash、Merkle proof、edition root、Injective 交易 | 永久 |

这正对应书中的倒金字塔分层记忆：L1 像 RAM，信息最多、最快也最易失；L2 是中转缓存；L3 只沉淀经过筛选、压缩与验证的长期知识。“巩固”对应人工批准与 Merkle 版次生成，“检索”对应 App/API 把历史精选版次重新加载到界面，“遗忘”对应七日热缓存清理。

清理器只会删除经过严格日期校验的顶层 `YYYY-MM-DD/` 目录。`editions/`、`status.json`、配置和其他目录不在删除范围。链上提交确认后，`commit-knowledge-edition.mjs` 会把精选内容压缩写入永久档案；候选新闻、模型草稿和失败搜索不会进入档案。

这意味着：七天后完整新闻工作区会消失，但已经筛选、核验、人工批准并进入 Merkle 版次的知识仍可长期下载和复验。

## 定时运行

不需要额外 Python 定时文件。项目现有运行时是 Node，`daily-worker.mjs` 已经包含每日调度循环，生产环境由 PM2 守护：

```bash
KNOWLEDGE_RUN_HOUR_UTC=0 \
KNOWLEDGE_RUN_MINUTE_UTC=10 \
KNOWLEDGE_RETENTION_DAYS=7 \
npm run knowledge:worker
```

默认每天 UTC 00:10（北京时间 08:10）运行。单次手动运行：

```bash
npm run knowledge:refresh -- --once
npm run knowledge:refresh -- --once --date=2026-07-18 --topics=ai,finance
```

## App / API 数据边界

Public Knowledge Earth 在 Pocket Earth App 端渲染。正文、来源、评分和 Merkle proof 进入资源包，Injective 只保存每日版次根和修订关系：**渲染在端上，内容在包里，指纹在链上。**

- `GET /api/knowledge?tool=topics`：八个子 Agent 配置。
- `GET /api/knowledge?tool=today&topic=ai&date=YYYY-MM-DD`：当天热缓存或精选版次。
- `GET /api/knowledge?tool=archive&date=YYYY-MM-DD`：永久精选档案。
- `GET /api/knowledge?tool=archive&topic=finance&date=YYYY-MM-DD`：精选档案的单领域视图。
- `GET /api/knowledge?tool=pack&date=YYYY-MM-DD`：可下载验证包。
- `GET /api/knowledge?tool=podcast&date=YYYY-MM-DD`：从已核验记录编排出的口袋播客与文字稿；每段保留来源、分数和运行轨迹。
- `GET /api/knowledge?tool=proof&recordHash=0x...`：Merkle proof。
- `POST /api/knowledge?tool=refresh&topic=ai`：仅本机或 Bearer 管理员可触发。

已锚定的 revision 2 继续使用 `fact-atlas-daily-edition/v1` 单棵每日树，保持验证兼容。未来如升级为“一主题一棵子树、一天一个总根”，必须发布新 schema，不能改写旧版次。

## 验证

```bash
npm run verify:knowledge-agent-harness
npm run verify:knowledge-worker
npm run verify:knowledge-api
npm run verify:knowledge-pack
```

测试覆盖八 Agent 共用一套策略、过期/聚合器来源拒绝、独立来源约束、硬预算停止、领域故障隔离、七日安全清理、永久精选档案和禁止自动链上写入。

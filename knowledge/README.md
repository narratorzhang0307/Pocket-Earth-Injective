# Daily Knowledge Worker

`daily-worker.mjs` 把 FactAtlas 的公开信息检索与双角色核验变成独立长期进程。它与 Pocket Earth Web 服务解耦：Web 进程负责读取与展示，worker 每天为 AI、金融、科学、气候和文化五个领域生成草稿快照。

## 分发与链上边界

Public Knowledge Earth 只在 Pocket Earth App 中渲染。知识正文、来源、评分和 Merkle proof 进入可下载资源包，Injective 只保存每日版次根和修订关系：**渲染在端上，内容在包里，指纹在链上。** 浏览和本地复验都是只读行为，不要求用户发送链上交易。

当前已锚定的 revision 2 使用 `fact-atlas-daily-edition/v1` 单棵每日树，必须保持验证兼容。后续 schema 才采用“一主题一棵子树、一天一个总根”的双层证明；不能为了新结构改写已经公开的 revision 2。

## 安全边界

- worker 只处理公开信息，不读取 Pocket Earth 私人记忆。
- 每个领域失败互不影响，`status.json` 保存心跳与失败原因。
- 文件使用临时文件 + rename 原子更新，避免进程中断留下半份 JSON。
- worker 不读取 Injective 私钥，也不自动提交链上交易。审阅快照后，才运行显式 Chronicle 提交命令。
- AI 与金融是当前已锚定的决赛版次；扩展领域先保持 draft-only，不能悄悄改变已公开的 edition root。

## 单次运行

```bash
npm run knowledge:refresh -- --once
npm run knowledge:refresh -- --once --date=2026-07-17 --topics=ai,finance
```

默认输出到被 git 忽略的 `var/knowledge/<date>/`。可用 `KNOWLEDGE_DATA_DIR` 或 `--output-dir=` 指定目录。

## 常驻运行

```bash
KNOWLEDGE_RUN_HOUR_UTC=0 KNOWLEDGE_RUN_MINUTE_UTC=10 npm run knowledge:worker
```

生产环境由 systemd、pm2 或容器重启策略守护该命令。模型 provider 没有配置时，AI / 金融输出明确标注的策展版本，其他领域标为 `skipped`；不会把未核验草稿伪装成 LIVE 版次。

运行前后使用：

```bash
npm run verify:knowledge-worker
npm run verify:knowledge-api
npm run verify:knowledge-pack
```

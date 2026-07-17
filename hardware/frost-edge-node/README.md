# Frost Edge Node（硬件线交付目录）

> 双线计划（Codex 软件线 × Claude 硬件线）中 Claude 的独占写入目录。
> 合同：Frost Hardware Event Contract **v0.1.0**（见 `../frost-buddy/`，本周冻结不升级）。
> 本目录不 import Pocket Earth 前端 / Injective SDK，不读钱包、私钥、个人画像，不修改 sunset-radio。

## 目录

| 路径 | 内容 | 任务 |
|---|---|---|
| `raspi/frost_pocket_consumer.py` | sidecar 消费器：HTTP 轮询 / `--file` 离线重放 / cursor / 退避 | HW-01 |
| `raspi/frost_pocket_actions.py` | action sink：`emit-json`（离线/终端）与 `pi`（真机，接 HW-02 drivers） | HW-01/02 |
| `raspi/frost_pocket_consumer_smoke.py` | 15 项离线冒烟（fixture 重放 / 契约拒绝 / mock HTTP / cursor / token 不泄漏） | HW-01 |
| `fixtures/demo-events.jsonl` | 权威 envelope fixture（由冻结桥 `frost-hardware-bridge.mjs demo` 生成） | HW-01 |
| `systemd/frost-pocket.service` + `frost-pocket.env.example` | 与日落电台并列的 sidecar 服务模板 | HW-04 |
| `integration/` | 若需对 sunset-radio 做最小兼容改动，可复现补丁沉淀于此（当前为空） | — |
| `docs/hw00-baseline.md` | 开工基线快照（两仓 git status、Pi 可达性） | HW-00 |

## 快速开始（任何机器，无需 Pi / 无需主服务）

```bash
cd hardware/frost-edge-node/raspi
# 离线重放权威 fixture：输出 6 条 action JSONL（state/tts/display × 2 事件）
python3 frost_pocket_consumer.py --file ../fixtures/demo-events.jsonl
# 全套冒烟
python3 frost_pocket_consumer_smoke.py
```

## 对接真实 feed（等 Codex SW-02 就绪后）

```bash
FROST_FEED_TOKEN=<token> python3 frost_pocket_consumer.py \
  --feed-url http://<host>:<port>/api/frost-feed --once
```

协议（冻结）：`GET /api/frost-feed?after=<cursor>&limit=1`，`Authorization: Bearer`，
`200`=一条 JSONL envelope + `X-Frost-Next-Cursor` 响应头，`204`=无事件，`401`=token 错。
消费器保证：事件三类 action（state→LED/表情、tts→语音、display→卡片）**全部成功后**才原子保存 cursor；
失败不推进、指数退避；日志绝不打印 token。

## 任务状态

| 任务 | 状态 |
|---|---|
| HW-00 基线保护 | DONE（见 docs/hw00-baseline.md；sunset-radio 四个已改文件列入保护名单，未触碰） |
| HW-01 consumer sidecar | DONE（15/15 冒烟通过，evidence 见 smoke 输出） |
| HW-02 action→Whisplay 映射 | 代码 DONE（`frost_pocket_pi_drivers.py`，16/16 冒烟通过；display→pi-state 字幕卡 / tts→dialog 门控+marker+pi-tts→espeak 兜底 / state→daemon LED 瞬闪；绝不抢 Whisplay 前台），真机验证 TODO；集成配方见 `docs/sunset-radio-integration-recon.md` |
| HW-03 Pocket Earth 换皮 | TODO |
| HW-04 systemd 部署 | 模板 DONE，真机安装 TODO |
| HW-05 离线/热点降级 | 消费器侧 DONE（--file 重放），Pi 侧 TODO |
| HW-06 真机联调 | BLOCKED：sunset-pi.local 当前不可达（fixture-first 按计划） |
| HW-07 备份录像 | TODO |
| HW-08 口径守门 | 持续（不承诺量产/不讲收藏品/「硬件的价值不在盒子稀缺，而在盒子里住着谁」） |

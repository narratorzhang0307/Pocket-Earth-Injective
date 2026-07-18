# Pocket Earth → Frost Edge Node 实时联调契约

这条 handoff 只传公开事件：Pocket Earth 服务端负责 Injective testnet 实时链读、鉴权、事件模板和 cursor；树莓派物理 sidecar 只把事件映射到 LED、屏幕和 TTS。两边都不导入对方的业务代码。

## 软件端（Codex）

1. 在服务端和 Pi 的环境中配置同一个随机 `FROST_FEED_TOKEN`，真实值不进 Git、不用 `VITE_` 前缀。
2. 启动 `server.mjs`。`/api/frost-feed` 会在服务端读取 `builderCode=pocket-earth` 的 Injective testnet 身份，再生成白名单 JSONL。
3. `speak` 只能由 server-side 模板产生；Pi 不拼链上文案，也不读取钱包、私钥、画像原文或精确位置。
4. 服务端用 `x-frost-next-cursor` 标记事件；客户端成功产出 action 后才原子落盘 cursor，重启后不会重播旧事件。

本机软件守门：

```bash
npm run verify:hardware-handoff
```

它会启动真实 HTTP 端口，验证错误 token 返回 401、实时读回 agentId 43–47、服务端 `speak` 生成 `state/tts/display`，以及第二次轮询不重播。

## 物理端（Frost Edge Node）

先在 Pi 本地配置环境变量；不要把 token 写进命令历史、日志或仓库：

```bash
export FROST_FEED_URL='https://<Pocket-Earth-host>/api/frost-feed'
export FROST_FEED_TOKEN='<与服务端一致的随机 token>'
python3 hardware/frost-buddy/raspi/frost_pi_feed_client.py
```

`frost_pi_feed_client.py` 每次产生三类公开 action：

- `state`：`frost_pi_device_driver.py` 映射到 RGB LED；`attention` 是链上见闻，`busy` 是音乐。
- `tts`：driver 原样交给本地 MiniMax TTS，失败时回落离线 `espeak-ng`，不能重写或追加链上事实。
- `display`：driver 映射到 240×280 Whisplay 屏幕，显示标题、摘要和公开 agentId，并同步到 `:8766` 手机镜像。

联调前可单次轮询，避免 daemon 干扰：

```bash
python3 hardware/frost-buddy/raspi/frost_pi_feed_client.py --once \
  --cursor-file /tmp/pocket-earth-frost.cursor
```

仓库内物理 driver 已完成 LED 转色、Whisplay 证据卡、本地 MiniMax / 离线 TTS、手机镜像、cursor 防重播与 systemd 自启。driver 只接在 `state/tts/display` 后，不修改 JSONL envelope、feed token/cursor 规则、Injective 链读或 Pocket Earth 主应用。目录、权限、端口和进程隔离见 [`LINUX-LAYOUT.md`](LINUX-LAYOUT.md)。

部署与真机快检：

```bash
hardware/frost-buddy/raspi/deploy-to-pi.sh sunset-pi
ssh sunset-pi '/opt/pocket-earth-edge/frost_pi_live_preflight.py --strict'
```

## 解耦边界

| 层 | 所有者 | 验收结果 |
|---|---|---|
| Injective 实时只读、server-side `speak`、Bearer token、cursor | Pocket Earth / Codex | `npm run verify:hardware-handoff` |
| JSONL → `state/tts/display` | 仓库内 Pi adapter | 同一条守门自动覆盖 |
| LED、Whisplay、TTS、镜像 | 仓库内 physical driver / Pi 真机 | `frost_pi_live_preflight.py --strict` + 现场观察 |

Pi 断电、离线或删除整个物理 driver 都不会影响 Pocket Earth 软件；Pocket Earth 前端升级也不要求改动屏幕、LED 或 TTS driver。

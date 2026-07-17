# Pocket Earth Pi Sidecar 非侵入集成简报（sunset-radio 侦察，2026-07-17）

> 只读侦察产物：HW-02 驱动的实现依据。约束前提：sunset-radio 全部通过**公共本地面**集成——HTTP（`127.0.0.1:8080`）、Unix socket（`/tmp/whisplay-daemon.sock`）、共享状态文件（`~/.local/share/sunset-radio/*.json`、`/tmp/sunset-radio-tts-active`）。不改动任何 sunset-radio 文件。

## 1. Whisplay 屏幕共存

**厂商 daemon IPC**（`whisplay/Whisplay-main/APP_INTEGRATION.md:52-77`，实现 `daemon/whisplay_daemon.py:681-800`）：Unix socket `/tmp/whisplay-daemon.sock`，行分隔 JSON，`{version:1, cmd, payload}` → `{ok, payload|error}`。命令集：`health.ping / app.register / app.list / app.launch / app.focus.acquire / framebuffer.acquire / app.focus.release / app.exit.request / backlight.set / led.set / led.fade / button.get_state / events.subscribe`。

**前台是独占的**：`framebuffer.acquire` 要求 `foreground_app_id==app_id` 且 session_token 匹配（`whisplay_daemon.py:734-739`）；`_grant_focus` 若已有别的 app 在前台会直接 `raise "another app is already foreground"`（`:312-313`）。

**whisplay_status.py 接入方式**（`raspi/whisplay_status.py:1096-1160`）：注册 `app_id="sunset-radio-status"`，流程 `ping→register→start_event_listener→acquire_foreground`，抢不到就退避重试，被挡满 `SUNSET_FG_RESCUE_SEC`（默认 **180s**）就 `systemctl restart whisplay-daemon.service` 夺屏（`:1134-1159`）。拿到前台后 mmap 直写 RGB565（`whisplay_client.py:168-184`）。它**每 2.5s 轮询 `/api/pi-state`**（`:504-506`、主循环 `:1310-1336`），每 5s 轮询 `/api/pi-pet`。

**字幕卡（intertitle）触发链**：主循环发现 `state.message` 变化且通过 `intertitle.should_show` 过滤时，锁存全屏打字机播放（`:1317-1336`、`draw_intertitle :1166-1207`）。卡的数据源就是 **`/api/pi-state` 的 `message` 字段**。噪音过滤（`raspi/intertitle.py:106-131`）拒掉：`city=="语音控制"`、`status=="queued"`、`label∈{语音待命,语音待查,转文字,已听到}`、含「没有听清/继续监听/已静音，载入」、等于当前「歌手 - 歌名」行。

**结论：第二进程显示卡片的最干净路径 = `POST /api/pi-state {"message": …}`，绝不抢前台。** 抢前台会失败（whisplay_status 持有）；即便强行让出，whisplay_status 主循环无 re-acquire 逻辑，focus 被 revoke 后 `draw_image` 因 `_mmap is None` 静默空转，屏幕冻结直到服务重启。

## 2. TTS

**`/api/pi-tts`**（`server.mjs:674-714`）：`POST {text, mode?, dryRun?}`；`mode:"dialog_branch"` 上限 420 字，否则 80 字。成功返回 `Content-Type: audio/mpeg`（MiniMax mp3）；按 `sha1(model\nvoice\ntext)` 缓存。**出错也返回 HTTP 200 但 body 是 `{ok:false}` JSON**（判真伪靠 content-type 含 `audio/`，`voice_reply.py:119`）。

**voice_reply.py**：`synth_server_tts` POST `{text}` 存 mp3（`:99-123`）；播放优先 `SUNSET_TTS_PLAY_COMMAND`，否则依次 `afplay/ffplay/mpg123/cvlc`——**没有 aplay**；espeak 兜底 `espeak-ng -v zh -s 150 <text>`（`:164-175`）。`speak_text` 默认 `require_dialog=True`。

**audio_mode.py 四态门控**：`hard_mute/soft_mute/dialog/radio`，文件 `~/.local/share/sunset-radio/audio-mode.json`。`audio_allows_dialog = mode∈{dialog,radio}`；dialog/radio 到期自动回落 soft_mute。

**尊重 soft_mute 是硬约束**：`raspi/mute_guard.sh:30-35` 每 3s 在非 dialog/radio 态把 sink 静音、`pkill ffplay/cvlc`。sidecar 播报前必须：① `save_audio_mode("dialog", ttl_sec=25, reason=…)`（参照 `pi_command_daemon.py:1798`，`AUDIO_DIALOG_TTL_SEC=25`）；② 播放期间 `touch /tmp/sunset-radio-tts-active`（mute_guard 仅在 dialog 态且 marker 存在时不杀播放器，`mute_guard.sh:18-25`）。非用户明确要求出声时，非 dialog/radio 态只上屏不出声。

## 3. LED

RGB LED 由**厂商 daemon 独占硬件**，`led.set`/`led.fade` 是**无 session、无前台要求的全局命令**（`whisplay_daemon.py:775-790`）。真正常态写灯的是 whisplay_status（按宠物情绪色，**每 30s 重申一次**，`:516-523, 1350-1362`）→ sidecar 只适合「短暂闪一下作 ack」。daemon 不在时 whisplay_status 直控 SPI/GPIO，两进程无法共享硬件，此时 LED 无 sidecar 通路（静默跳过）。

## 4. 本机 HTTP 面

服务 `PORT=8080`（`server.mjs:42-43`）。
- **`/api/pi-control`**（`:492-544`）：`POST {text, source?, target?}` 入队；`GET ?claim=1&client=X` 一次性认领。
- **`/api/pi-state`**（`:546-564`）：`GET → {ok,state}`；`POST` 经 `mergePiState`（`:434-453`）合并——**只传 `{message}` 会保留 status/city/track**，这是喂卡片的干净法。
- **`/api/pi-pet`**（`:303-329`）：`POST {"screen": dataURL-JPEG}`（≤200KB）可把卡片镜像到手机；但 whisplay_status 每 5s 推整屏，last-writer-wins 会互相顶替——只宜展示瞬间推一两帧。

## 5. 部署常量

- 代码路径 `PI_DIR=/home/pi/sunset-radio`（`deploy-raspi.local.sh:12`）；`SUNSET_API=http://127.0.0.1:8080`。
- systemd 命名：`sunset-radio.service` / `-whisplay` / `-pisugar-button` / `-pi-native` / `-voice` / `-wifi-failover.timer` + 厂商 `whisplay-daemon.service`。
- Python = 系统 `/usr/bin/python3`，无 venv；PIL/espeak-ng/ffmpeg/字体走 apt；**numpy 可选**。

## 6. 风险清单（必须真机验证）

1. **抢前台=冻屏**（静态读码结论）→ 决定绝不走 daemon framebuffer 路，只走 pi-state。
2. **180s 夺屏**：sidecar 永不持前台即可规避。
3. **pi-state message 竞态**：2.5s 轮询 + last-wins，高频 state POST 可能顶掉卡片——真机测命中率。
4. **LED 30s 覆盖 / pi-pet 5s 顶替**：均只宜瞬时使用。
5. **TTS marker 生命周期**：`runtime_maintenance.py` 清 >120s 陈旧 marker；sidecar 播完必须自己清 marker。

## 7. HW-02 实现落点

`frost_pocket_pi_drivers.py`：display→`POST /api/pi-state {"message"}`（失败抛错→consumer 保 cursor 重试）；tts→audio_mode dialog 门控 + marker + `/api/pi-tts`（content-type 校验）→ffplay/mpg123/cvlc，espeak-ng 离线兜底（tts 失败不致命）；state→daemon socket `led.fade` 瞬闪（attention=Injective 紫，busy=暖橙；不可用静默跳过）。全部配置懒读 env，可在任何机器 mock 冒烟。

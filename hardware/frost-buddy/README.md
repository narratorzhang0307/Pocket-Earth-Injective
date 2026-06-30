# Frost Buddy · Frost Edge Node

Frost Buddy 是 Pocket Earth 的树莓派硬件延展：Pocket Earth 仍然是空间知识库和 agent harness，Injective 仍然是公共身份与回执层；本目录只负责把已经公开的产品事件变成硬件可以消费的 JSONL envelope。硬件不碰私钥、不签名、不读取原始画像、不拿精确坐标。

## 一句话定位

Frost Edge Node 让 Frost 从屏幕里走到桌面上：music-agent 可以被实体 Frost 播报，public-plaza 读到的 Injective 链上见闻也可以被实体 Frost 用人话讲出来。

这不是重资本硬件路线，也不是当前收入支柱。Frost Edge Node 模块先承担三个角色：

| 角色 | 说明 |
|---|---|
| 体验差异化 | 有声音、小屏幕、按钮或灯效的 Frost，比网页里的 bot 更容易被用户记住 |
| 开发套件 | Raspberry Pi / BLE / serial / MQTT / TTS 都可以作为可替换 adapter，先把事件合同跑稳 |
| 公开事件端点 | 只消费 `music_now_playing` 和 `chain_dispatch`，把 Pocket Earth 与 Injective 的公开证据带到房间里 |

## 硬件原理

```text
Pocket Earth App / server
  -> music-agent now playing
  -> public-plaza chain dispatch
  -> frost-hardware-bridge.mjs
  -> newline-delimited JSON
  -> Raspberry Pi skill router / adapter
  -> BLE、serial、MQTT、本地 TTS、小屏幕、按钮反馈
```

### 1. Pocket Earth 产生事件

- `music-agent` 产生当前播放、歌手、城市和短播报文案。
- `public-plaza` 从 Injective 读取 `builderCode=pocket-earth` 的公开 agent，生成 Nightly Chain Dispatch。
- 这两类事件已经是公开事件，不包含书影音原文、照片、心情原文、长期画像计数或精确坐标。

### 2. `frost-hardware-bridge.mjs` 做事件合同

桥接层只输出 JSONL。每个 envelope 只允许这些字段：

```text
version, kind, source, state, priority, title, body, speak,
agentIds, scanUrl, track, city, createdAt
```

允许的事件类型：

| `kind` | 来源 | 硬件行为 |
|---|---|---|
| `music_now_playing` | `music-agent` | TTS 读出当前播放，屏幕显示曲名/城市，设备状态进入 `busy` |
| `chain_dispatch` | `injective-public-plaza` | TTS 读出链上见闻，屏幕展示 agentId 和 Blockscout 链接，设备状态进入 `attention` |
| `buddy_status` | 未来 adapter | 表情、在线状态或本地设备健康状态 |

运行示例：

```bash
node hardware/frost-buddy/frost-hardware-bridge.mjs demo
```

输出示例：

```json
{"version":"0.1.0","kind":"chain_dispatch","source":"injective-public-plaza","state":"attention","priority":"urgent","title":"Injective chain dispatch","body":"builderCode=pocket-earth returned agentId 43-47 from Injective testnet.","speak":"Frost 在 Injective 链上遇见了 5 个 Pocket Earth agent。","agentIds":["43","44","45","46","47"],"scanUrl":"https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e","createdAt":"2026-06-29T00:00:01.000Z"}
```

### 3. Raspberry Pi 技能路由做安全入口

`raspi/frost_pi_skill_agent.py` 是 Pi 侧的轻量 skill router。它把松散语音先归一化到白名单，再输出固定音乐命令或公开硬件事件。

| 语音意图 | 输出 |
|---|---|
| “下一首 / 换一首 / skip” | 固定命令 `下一首` |
| “暂停 / 别播了 / stop” | 固定命令 `暂停` |
| “现在播什么” | `music_now_playing` JSONL 事件 |
| “播报 Injective 链上见闻” | `chain_dispatch` JSONL 事件 |
| “你能做什么” | 固定命令 `帮助` |

离线冒烟：

```bash
python3 hardware/frost-buddy/raspi/frost_pi_skill_agent_smoke.py
```

冒烟不需要网络、钱包、daemon、BLE 设备或 GitHub token。校验重点是：skill 名称唯一、关键词路由稳定、云脑幻觉 skill 会被拒绝、公开事件能 JSONL 往返、私钥/secret/env/profile-hash 形态会被拦下。

### 4. Raspberry Pi 事件适配分支保持解耦

`raspi/frost_pi_event_adapter.py` 是单独的 Pi 侧 adapter lane：输入只接受 `frost-hardware-bridge.mjs` 产出的公开 JSONL envelope，输出只生成三类 transport-neutral action。

| action | 给谁用 | 说明 |
|---|---|---|
| `state` | LED、表情、小屏幕状态机 | `busy` / `attention` / `idle` 等状态，不包含业务私密数据 |
| `tts` | 本地 TTS 或蓝牙音箱 | 只读取 `speak` 公开播报文案 |
| `display` | OLED、e-ink、WebSocket 面板 | 展示标题、摘要、公开 `agentIds` 与 Blockscout `scanUrl` |

这条分支不 import Pocket Earth 前端、不 import Injective 服务、不签名、不联网，也不绑定 BLE / serial / MQTT 的具体实现。后续真实设备只需要把 action 映射到自己的传输层；删掉这个 adapter 也不会影响主 app、`public-plaza`、`agent-plaza` 或链上证据 API。

离线冒烟：

```bash
python3 hardware/frost-buddy/raspi/frost_pi_event_adapter_smoke.py
```

完整硬件快检 `npm run verify:hardware` 会同时跑技能路由和事件适配分支，防止硬件叙事停留在 Markdown。

## 与 Injective 的关系

Frost Edge Node 不直接写链。Injective 仍然通过服务端 API 与证据包连接：

| Injective 层 | 硬件看到什么 | 硬件看不到什么 |
|---|---|---|
| ERC-8004 身份 | `agentId 43-47`、`builderCode=pocket-earth`、公开 Blockscout 链接 | 私钥、签名材料、注册交易构造过程 |
| SocialHandshake | 已公开的相遇结果、score、可读叙事 | 名片原文、`profileHashA/B` 原文、任何隐私承诺值 |
| public-plaza | Nightly Chain Dispatch 的公开播报文本 | 用户的长期画像计数、精确坐标、照片和心情 |
| Profile Chain 未来回执 | `profileHash + version + timestamp` 的公开版本提示 | 本地 Proof of Memory 的原始记录 |

写链路径仍然是 `suggest -> confirm -> sign`，必须由服务端持有必要配置并显式 `confirm:true`。硬件只读公开事件，不参与钱包签名，也不替用户做安装、付款或握手确认。

## 市场边界与产品判断

PPT 的硬件结论是：实体节点，不是重资本硬件路线。Frost Edge Node 的市场判断在 Markdown 里拆成三层：

1. **为什么选 Raspberry Pi**：Raspberry Pi 官方投资者页披露累计出货超过 6700 万台，说明它是足够成熟的原型与开发板平台；2024 IPO 文件也披露过超过 6000 万台的历史出货。Pocket Earth 用树莓派是为了降低原型风险，不是用这些数字预测硬件销量。
2. **为什么不把硬件当主收入**：消费级 AI 硬件风险高，Pocket Earth 不把 Frost Buddy 写成量产产品。硬件先服务于 demo、开发套件、房间里的存在感和 agent 体验差异。
3. **真正的商业主线**：长期使用沉淀可信画像；可信画像进入 Agent Plaza；开发者发布符合空间逻辑的 agent；安装、调用、评价和未来可选付费在 Injective 上留下回执。硬件可以成为某些 agent 的高级端点，但不是平台成立的前提。

可引用来源：

- Raspberry Pi investor relations: https://investors.raspberrypi.com/
- Raspberry Pi 2024 IPO/RNS source: https://data.fca.org.uk/artefacts/NSM/RNS/5182805.html
- Roblox annual reports: https://ir.roblox.com/financials/annual-reports/default.aspx
- Apple App Store Small Business Program: https://developer.apple.com/app-store/small-business-program/
- Steamworks revenue-share announcement: https://steamcommunity.com/groups/steamworks/announcements/detail/1697191267930157838

这些来源只支撑“成熟原型平台”和“平台抽成有先例”两件事；Pocket Earth 不把外部平台规模外推成自身收入预测。

## 隐私与安全边界

| 可以进入硬件 | 不可以进入硬件 |
|---|---|
| `speak` 播报文案、公开 `agentIds`、Blockscout `scanUrl`、曲名、歌手、城市名 | 私钥、助记词、server env、钱包签名材料 |
| 设备状态：`idle` / `busy` / `attention` | 原始画像、照片、心情、书影音原文、精确坐标 |
| 白名单音乐命令 | 任意代码执行、任意 URL 抓取、支付动作 |
| 公开 chain dispatch | `profileHashA/B` 原文、`bytes32` 承诺值、未公开的 Taste Passport |

未来增加 adapter 时也要遵守这条线：transport-specific 代码只能消费公开 envelope，不能扩大事件字段。

## 后续 adapter

当前仓库拥有的稳定部分是事件合同和 Pi 侧技能路由。后续可以在不改变主 app 的情况下新增：

- `adapters/ble-nus-pi.py`：BlueZ / Nordic UART BLE transport。
- `adapters/local-tts-pi.mjs`：本地 TTS。
- `adapters/display-pi.mjs`：OLED / e-ink 小屏幕。
- `adapters/mqtt-pi.mjs`：家庭局域网消息桥。

每个 adapter 都应保持可选、可删、可独立测试；Pocket Earth 主链路不依赖某个具体硬件传输实现。

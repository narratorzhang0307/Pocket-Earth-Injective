# Pitch Notes · Hardware Frost Buddy

## 建议放在 PPT 的一句话

Frost Buddy 是 Pocket Earth 的硬件延展：music-agent 可以变成桌面上的实体 Frost 播歌，public-plaza 读到的 Injective 链上见闻也可以被它用人话播报。

## 讲法边界

- 主链路仍然是 Injective ERC-8004 身份、`agentId 43-47`、Blockscout 证据、SocialHandshake 和 public-plaza 读链上 agent。
- 硬件不是本次 demo 的核心证明，只作为 “Agent x 物理世界” 的产品触角。
- 已完成的是 `hardware/frost-buddy/` 事件桥：把 music-agent 播放和 Injective chain dispatch 转成公开 JSONL，给 Raspberry Pi / BLE / TTS 适配器消费。
- 不要说成已量产、已完整硬件闭环或已经把私钥放进设备；硬件桥只读公开事件，不接触私钥、画像原文、精确坐标或名片哈希。

## 可引用的事实

Raspberry Pi 是可信的原型平台。Raspberry Pi Ltd 2024 IPO 文件披露：自 2012 年交易开始以来，Raspberry Pi 已售出超过 6000 万个单板电脑和计算模块；因此这里把它作为开发板/原型平台是合理的，但不要延展成市场规模预测。来源：https://data.fca.org.uk/artefacts/NSM/RNS/5182805.html

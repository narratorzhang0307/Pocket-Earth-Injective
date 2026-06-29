# Pitch Notes · Hardware Frost Buddy

## 建议放在 PPT 的一句话

Frost Buddy 是 Pocket Earth 的硬件延展：music-agent 可以变成桌面上的实体 Frost 播歌，public-plaza 读到的 Injective 链上见闻也可以被它用人话播报。

## PPT 页内建议

1. **Vision**：Pocket Earth 让 Frost 成为有空间记忆的 AI 分身；Injective 让这个分身有可验证的链上身份，而不是只停留在本地角色设定。
2. **Injective proof**：主证明仍是 `agentId 43-47`、`builderCode=pocket-earth`、Blockscout 钱包证据链、SocialHandshake 合约和 `npm run verify:injective`。
3. **Product loop**：public-plaza 从 Injective 读取真实 agent，按脱敏 Taste Passport 排相似度，把 agent 钉回地球，再生成 Nightly Chain Dispatch。
4. **Privacy boundary**：只上链身份、公开名片字段、名片哈希、相似度和时间戳；书影音原文、画像明细、精确坐标和私钥都不上链。
5. **Hardware extension**：Frost Buddy 只占一页角落或一行补充，表达为 Raspberry Pi / BLE / TTS 原型接口，把 music-agent 与 Injective `chain_dispatch` 公开事件播报出来。
6. **Future plan**：先把链上身份、广场发现、握手证据和公开复验做扎实，再接更完整的设备常驻进程、TTS 声线和可能的 x402 小额结算。

## 讲法边界

- 主链路仍然是 Injective ERC-8004 身份、`agentId 43-47`、Blockscout 证据、SocialHandshake 和 public-plaza 读链上 agent。
- 硬件不是本次 demo 的核心证明，只作为 “Agent x 物理世界” 的产品触角。
- 已完成的是 `hardware/frost-buddy/` 事件桥：把 music-agent 播放和 Injective chain dispatch 转成公开 JSONL，给 Raspberry Pi / BLE / TTS 适配器消费。
- 树莓派侧也有一个轻量技能路由：松散语音先过白名单 skill，再输出音乐命令或公开 `chain_dispatch` 事件；这来自对既有 Pi 原型的只读研究，但本轮只推送 Pocket-Earth-Injective 仓库。
- 不要说成已量产、已完整硬件闭环或已经把私钥放进设备；硬件桥只读公开事件，不接触私钥、画像原文、精确坐标或名片哈希。
- PPT 完成前可跑 `npm run verify:pitch`，它会检查 pitch 备注、外部来源、硬件边界、`npm run verify:hardware` 和 `npm run verify:injective` 是否仍对齐。

## 可引用的事实

Raspberry Pi 是可信的原型平台。Raspberry Pi Ltd 2024 IPO 文件披露：自 2012 年交易开始以来，Raspberry Pi 已售出超过 6000 万个单板电脑和计算模块；因此这里把它作为开发板/原型平台是合理的，但不要延展成市场规模预测。来源：https://data.fca.org.uk/artefacts/NSM/RNS/5182805.html

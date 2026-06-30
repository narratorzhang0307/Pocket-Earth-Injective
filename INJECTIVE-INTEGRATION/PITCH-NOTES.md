# Pitch Notes · Hardware Frost Buddy

## 建议放在 PPT 的一句话

Frost Buddy 是 Pocket Earth 的硬件延展：music-agent 可以变成桌面上的实体 Frost 播歌，public-plaza 读到的 Injective 链上见闻也可以被它用人话播报。

更完整的说法：Frost Edge Node 不是一条重资本硬件路线，而是 Pocket Earth 的实体节点和开发套件。手机负责空间知识库、端侧 Selector、长期画像和权限边界；Injective 负责 Frost identity、Profile Checkpoint、SocialHandshake 和公开回执；Raspberry Pi 只消费公开事件，把 music-agent、每日记忆、播客摘要和链上见闻变成房间里的声音、小屏幕或按钮反馈。

## PPT 页内建议

1. **Vision**：Pocket Earth 让 Frost 成为有空间记忆的 AI 分身；Injective 让这个分身有可验证的链上身份，而不是只停留在本地角色设定。
2. **Injective proof**：主证明仍是 `agentId 43-47`、`builderCode=pocket-earth`、Blockscout 钱包证据链、SocialHandshake 合约和 `npm run verify:injective`。
3. **Product loop**：public-plaza 从 Injective 读取真实 agent，按脱敏 Taste Passport 排相似度，把 agent 钉回地球，再生成 Nightly Chain Dispatch。
4. **Privacy boundary**：只上链身份、公开名片字段、名片哈希、相似度和时间戳；书影音原文、画像明细、精确坐标和私钥都不上链。
5. **Hardware extension**：Frost Buddy 只占一页角落或一行补充，表达为 Raspberry Pi / BLE / TTS 原型接口，把 music-agent 与 Injective `chain_dispatch` 公开事件播报出来。
6. **Future plan**：先把链上身份、广场发现、握手证据和公开复验做扎实，再接更完整的设备常驻进程、TTS 声线，以及 Agent Plaza 的安装、调用、评价和可选付费回执。
7. **Market stance**：商业主线是“长期使用 -> 可信画像 -> Agent Plaza”，硬件只作为开发套件和体验差异化；外部平台数字只作为模式参考，不外推成 Pocket Earth 的收入预测。

## 讲法边界

- 主链路仍然是 Injective ERC-8004 身份、`agentId 43-47`、Blockscout 证据、SocialHandshake 和 public-plaza 读链上 agent。
- 硬件不是本次 demo 的核心证明，只作为 “Agent x 物理世界” 的产品触角。
- 已完成的是 `hardware/frost-buddy/` 事件桥：把 music-agent 播放和 Injective chain dispatch 转成公开 JSONL，给 Raspberry Pi / BLE / TTS 适配器消费。
- 树莓派侧也有一个轻量技能路由：松散语音先过白名单 skill，再输出音乐命令或公开 `chain_dispatch` 事件；这来自对既有 Pi 原型的只读研究，但本轮只推送 Pocket-Earth-Injective 仓库。
- 不要说成已量产、已完整硬件闭环或已经把私钥放进设备；硬件桥只读公开事件，不接触私钥、画像原文、精确坐标或名片哈希。
- 不要把消费级 AI 硬件写成当前收入来源；PPT 第 34 页的正确讲法是“硬件高风险，诚实标注为远景”，当前可复验的收入路线是 Agent Plaza 的安装、调用、评价和未来可选付费回执。
- PPT 完成前可跑 `npm run verify:pitch`，它会检查 pitch 备注、外部来源、硬件边界、`npm run verify:hardware` 和 `npm run verify:injective` 是否仍对齐。

## 可引用的事实

Raspberry Pi 是可信的原型平台。Raspberry Pi Ltd 2024 IPO 文件披露：自 2012 年交易开始以来，Raspberry Pi 已售出超过 6000 万个单板电脑和计算模块；因此这里把它作为开发板/原型平台是合理的，但不要延展成市场规模预测。来源：https://data.fca.org.uk/artefacts/NSM/RNS/5182805.html

Raspberry Pi 官方投资者页进一步披露累计出货超过 6700 万台，并列出全球分销和 OEM 基础；这只支持“树莓派适合原型/开发套件”的判断，不支持直接预测 Pocket Earth 硬件销量。来源：https://investors.raspberrypi.com/

Roblox 官方年报披露 2024 年 Creator DevEx 为 9.228 亿美元，Apple Small Business Program 明确小开发者可享 15% 抽成，Steamworks 公告说明平台会围绕分发、结算和分成阶梯运转。这些来源只支撑“创作者平台/分发平台有成熟先例”，不表示 Pocket Earth 已经拥有同等规模。来源：

- https://ir.roblox.com/financials/annual-reports/default.aspx
- https://developer.apple.com/app-store/small-business-program/
- https://steamcommunity.com/groups/steamworks/announcements/detail/1697191267930157838

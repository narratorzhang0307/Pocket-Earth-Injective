import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const ROOT = path.join(
  PROJECT,
  "决赛提交的PPT",
  "PocketEarth_Injective_决赛产品全景截图库_2026-07-19",
);
const HIRES = path.join(ROOT, "15_PPT高清源图_第26-30页_2x");
const HARDWARE = path.join(ROOT, "09_硬件终端");
const OUT = path.join(
  PROJECT,
  "决赛提交的PPT",
  "第26-30页样稿预览-v1-高清无网格底-2026-07-20",
);
const PPTX = path.join(
  PROJECT,
  "决赛提交的PPT",
  "Pocket Earth on Injective-决赛路演PPT-第26-30页样稿-v1-高清无网格底-2026-07-20.pptx",
);

const IMG = {
  publicPodcastEntry: path.join(HIRES, "01_公共Agents口袋播客入口_2x.png"),
  answerWaiting: path.join(HIRES, "02_地球答案今天待揭晓_2x.png"),
  answerRevealed: path.join(HIRES, "03_地球答案软端揭晓结果_2x.png"),
  podcastLedger: path.join(HIRES, "04_口袋播客来源账本_2x.png"),
  podcastSecond: path.join(HIRES, "05_口袋播客第二条静默预览_2x.png"),
  hardwareAnswer: path.join(HARDWARE, "10_树莓派真机地球答案.jpg"),
  edgeLauncher: path.join(HARDWARE, "01_端侧三项目启动器.png"),
};

const C = {
  bg: "#F4F5F2",
  ink: "#171918",
  muted: "#666D69",
  soft: "#8B918D",
  green: "#21936D",
  greenDark: "#2A604F",
  mint: "#E2F1EA",
  white: "#FFFFFF",
  black: "#0C0F0E",
  cyan: "#18C6DD",
  blue: "#2D62DD",
  paleBlue: "#E6F0FF",
  azure: "#0078D4",
  azureLight: "#E5F3FF",
  purple: "#8F70DC",
  palePurple: "#EEE8FA",
  orange: "#F28A4B",
  paleOrange: "#FBE7D8",
  yellow: "#F4C84A",
  paleYellow: "#FFF2CC",
  coral: "#EF766D",
  paleCoral: "#F8E1DE",
  teal: "#39B9AD",
  cream: "#F7F2E6",
};

const F = { sans: "PingFang SC", mono: "Arial" };

async function bytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function contentType(file) {
  return file.toLowerCase().endsWith(".jpg") || file.toLowerCase().endsWith(".jpeg")
    ? "image/jpeg"
    : "image/png";
}

function rect(slide, x, y, w, h, fill, line = "none", width = 0, radius = null, shadow = null) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width },
    ...(radius ? { borderRadius: radius } : {}),
    ...(shadow ? { shadow } : {}),
  });
}

function textBox(slide, text, x, y, w, h, size, color = C.ink, bold = false, family = F.sans, align = "left") {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = { fontSize: size, color, bold, fontFamily: family, alignment: align };
  return shape;
}

function base(slide) {
  slide.background.fill = C.bg;
  rect(slide, 0, 0, 1280, 5, C.ink);
}

function tag(slide, label, x = 50, y = 72, w = 250, fill = C.green) {
  rect(slide, x, y, w, 34, fill, fill, 0, "rounded-md");
  textBox(slide, label, x + 14, y + 6, w - 28, 22, 15, C.white, false, F.mono);
}

function footer(slide, n, label) {
  rect(slide, 50, 663, 375, 1, "#C8CDCA");
  textBox(slide, `${String(n).padStart(2, "0")} / ${label}`, 50, 673, 360, 22, 11, C.soft, false, F.mono);
}

function bodyList(slide, lines, x, y, w, size = 16, gap = 50) {
  lines.forEach((line, i) => {
    rect(slide, x, y + i * gap + 8, 7, 7, i === 0 ? C.green : "#A8AFAB");
    textBox(slide, line, x + 18, y + i * gap, w - 18, gap - 6, size, C.muted, false);
  });
}

function callout(slide, title, body, x = 50, y = 520, w = 394, fill = C.mint, accent = C.green) {
  rect(slide, x, y, w, 91, fill, "#C6DBD1", 1);
  rect(slide, x, y, 5, 91, accent);
  textBox(slide, title, x + 18, y + 14, w - 35, 24, 17, C.greenDark, true);
  textBox(slide, body, x + 18, y + 47, w - 35, 34, 13, C.muted, false);
}

async function addImage(slide, imgPath, x, y, w, h, alt, fit = "cover", radius = "rounded-xl", line = "#4F5753") {
  rect(slide, x + 7, y + 9, w, h, "#D9DDDA", "none", 0, radius, "shadow-md");
  slide.images.add({
    blob: await bytes(imgPath),
    contentType: contentType(imgPath),
    alt,
    fit,
    position: { left: x, top: y, width: w, height: h },
    geometry: "roundRect",
    borderRadius: radius,
  });
  rect(slide, x, y, w, h, "none", line, 1.25, radius);
}

async function addPhone(slide, imgPath, x, y, w = 244, h = 528, alt = "Pocket Earth mobile interface") {
  await addImage(slide, imgPath, x, y, w, h, alt, "cover", "rounded-xl", "#4F5753");
}

function caption(slide, text, x, y, w, color = C.green) {
  textBox(slide, "▲", x, y, 18, 24, 14, color, true, F.mono);
  textBox(slide, text, x + 20, y - 1, w - 20, 38, 14, C.muted, false);
}

function notes(slide, voiceover) {
  slide.speakerNotes.textFrame.setText(voiceover);
  slide.speakerNotes.setVisible(true);
}

function smallLabel(slide, label, x, y, w, fill = C.black, color = "#7CFFB0") {
  rect(slide, x, y, w, 24, fill, C.ink, 1);
  textBox(slide, label, x + 7, y + 4, w - 14, 16, 10, color, true, F.mono, "center");
}

function stepCard(slide, { x, y, w, h, n, title, body, accent, fill }) {
  rect(slide, x, y, w, h, fill, C.ink, 1.1, null, "shadow-sm");
  rect(slide, x, y, w, 36, accent);
  textBox(slide, n, x + 10, y + 9, 34, 18, 11, C.white, true, F.mono, "center");
  textBox(slide, title, x + 48, y + 9, w - 58, 18, 11, C.white, true, F.mono, "center");
  textBox(slide, body, x + 18, y + 60, w - 36, h - 78, 15, C.ink, true, F.sans, "center");
}

function arrow(slide, text, x, y, w = 42, color = C.green) {
  textBox(slide, text, x, y, w, 30, 21, color, true, F.mono, "center");
}

async function slide26(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "MICROSOFT AZURE · STRICT LIVE GATE", 50, 43, 360, C.azure);
  textBox(s, "Azure 接入以真实请求为准，留下可复核的模型路由证据", 50, 91, 1120, 48, 35, C.ink, false);
  textBox(s, "Provider contract → Model Router → HTTP 2xx → actual deployment → Azure request ID", 50, 145, 1130, 27, 15, C.azure, true, F.mono);

  const cards = [
    { x: 50, n: "01", title: "REQUEST", body: "task + locale\nlatency budget\nquality level", accent: C.cyan, fill: "#E5FAFD" },
    { x: 280, n: "02", title: "PROVIDER ADAPTER", body: "统一请求格式\n密钥只在服务端\n超时与重试", accent: C.green, fill: C.mint },
    { x: 510, n: "03", title: "MODEL ROUTER", body: "单一部署入口\n按任务路由模型\n成本 / 质量策略", accent: C.azure, fill: C.azureLight },
    { x: 740, n: "04", title: "STRICT RESPONSE", body: "HTTP 2xx\n实际模型与部署\n真实响应内容", accent: C.purple, fill: C.palePurple },
    { x: 970, n: "05", title: "EVIDENCE", body: "Azure request ID\nlatency / fallback\nRunTrace", accent: C.orange, fill: C.paleOrange },
  ];
  cards.forEach((card, i) => {
    stepCard(s, { ...card, y: 205, w: 205, h: 227 });
    if (i < cards.length - 1) arrow(s, "→", card.x + 205, 303, 25, C.greenDark);
  });

  rect(s, 50, 468, 1180, 102, C.black, C.black, 0, "rounded-md", "shadow-md");
  textBox(s, "RUNTRACE", 73, 488, 125, 20, 14, "#7CFFB0", true, F.mono);
  textBox(s, "provider · deployment · model · latency · retry · fallback", 208, 488, 710, 22, 16, C.white, true, F.mono);
  smallLabel(s, "CONTRACT TESTS PASS", 941, 486, 248, C.greenDark, C.white);
  rect(s, 73, 525, 1116, 1, "#365046");
  textBox(s, "当前完成：Azure adapter + 离线合同测试", 73, 541, 490, 20, 14, "#CBD7D1", false);
  textBox(s, "待账号配置后验收：真实 endpoint / deployment / key / request ID", 582, 541, 607, 20, 14, C.yellow, true);

  rect(s, 50, 604, 1180, 38, C.azureLight, "#B9DDF6", 1);
  textBox(s, "决赛口径：展示已经完成的适配器与合同测试；真实 Azure 请求通过严格证据门后再标记完成。", 67, 615, 1146, 20, 15, "#185D91", true, F.sans, "center");
  footer(s, 26, "MICROSOFT AZURE MODEL INFRASTRUCTURE");
  notes(s, "这一页讲 Microsoft Azure 的接入边界。Pocket Earth 已经完成统一 provider adapter 和离线合同测试，Model Router 可以作为单一模型部署入口，按任务、时延预算和质量要求选择合适模型。真正上线时，我们用严格证据门验收：必须获得真实 HTTP 2xx、实际 deployment 和 model 信息、真实返回内容，以及可追踪的 Azure request ID。RunTrace 记录 provider、deployment、model、latency、retry 与 fallback。当前账号的 endpoint、deployment 和 key 仍需配置，因此现场只展示已经完成的适配器和合同测试，不把尚未发生的真实 Azure 请求写成完成。配置账号后，我们会立刻跑同一套 strict live verify。 ");
}

async function slide27(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "FROST EDGE NODE · HARDWARE HERO", 50, 72, 340, C.green);
  textBox(s, "Frost 已经有一具\n能工作的身体", 50, 134, 405, 90, 31, C.ink, false);
  textBox(s, "同一个角色，在 App、公共地球、身份卡和实体设备里保持可识别", 50, 235, 410, 58, 17, C.green, true);
  bodyList(s, [
    "Raspberry Pi 5 + Whisplay HAT · 240×280",
    "屏幕、RGB、按钮、麦克风与扬声器已经接入",
    "本地 TTS / 离线回退 / 手机镜像支持现场演示",
  ], 50, 320, 405, 15, 55);
  callout(s, "硬件的价值在于身份与访问权。", "买到的体验来自盒子里住着谁，以及它能带回什么。", 50, 524, 405);
  footer(s, 27, "FROST EDGE NODE");

  await addImage(s, IMG.hardwareAnswer, 500, 66, 398, 566, "Frost Edge Node real prototype showing Earth Answer", "cover");
  smallLabel(s, "REAL PROTOTYPE · SILENT MODE", 523, 84, 350, C.black, "#7CFFB0");
  await addPhone(s, IMG.answerRevealed, 961, 66, 239, 566, "Earth Answer revealed in Pocket Earth software");
  caption(s, "真机 · 地球答案与 RGB 状态", 510, 645, 390, C.orange);
  caption(s, "软件 · 同一套每日仪式与界面语言", 950, 645, 285, C.blue);
  notes(s, "请在这一页把 Frost Edge Node 举起来。左侧是真机照片，右侧是软件端地球答案；它们采用同一套每日仪式与界面语言。Frost 的统一轮廓和个人细节会同时出现在 App、公共地球、身份卡和实体设备中；这让形象承担产品入口，而不只承担装饰。设备使用 Raspberry Pi 5 与 Whisplay HAT，包含屏幕、RGB、按键、麦克风和扬声器，本地 TTS、离线回退与手机镜像已经纳入演示链路。硬件的价值来自身份和访问权：同一个 Frost 可以把公开知识、每日答案和夜间见闻带回房间。本周展示实体原型与真实界面，现场保持静音，不承诺量产、限量或收藏属性。 ");
}

async function slide28(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "POCKET EARTH LAUNCHER", 50, 64, 250, C.green);
  textBox(s, "一个 Launcher，收纳\n音乐、知识与行动提示", 50, 124, 430, 88, 31, C.ink, false);
  textBox(s, "单击移动 · 长按 1.2 秒进入 · 快速双击返回", 50, 232, 410, 34, 17, C.green, true);
  bodyList(s, [
    "日落电台：歌曲目录 / 日落时刻 / 随机骰子",
    "口袋播客：播客模式 / 文字模式 / 最后有效缓存",
    "地球答案：每日 00:00 解锁，只能回看过去",
    "静默首页：时间、日期、连接状态与今日一页",
  ], 50, 303, 410, 15, 48);
  callout(s, "结构清晰胜过功能堆叠。", "三个应用互为平行目录，退出一个不会干扰另外两个。", 50, 536, 405);
  footer(s, 28, "POCKET EARTH LAUNCHER");

  rect(s, 506, 88, 292, 504, C.white, "#4F5753", 1.25, "rounded-xl", "shadow-md");
  smallLabel(s, "/home/pi · PROJECT LAUNCHER", 527, 107, 250, C.black, "#7CFFB0");
  s.images.add({
    blob: await bytes(IMG.edgeLauncher),
    contentType: "image/png",
    alt: "Pocket Earth Edge launcher with three parallel applications",
    fit: "contain",
    position: { left: 532, top: 151, width: 240, height: 280 },
    geometry: "rect",
  });
  const apps = [
    ["日落电台", "MUSIC", C.orange],
    ["口袋播客", "KNOWLEDGE", C.green],
    ["地球答案", "ACTION", C.blue],
  ];
  apps.forEach(([zh, en, accent], i) => {
    rect(s, 528, 452 + i * 37, 248, 28, i === 1 ? C.mint : C.bg, C.ink, 0.8);
    rect(s, 538, 462 + i * 37, 7, 7, accent);
    textBox(s, zh, 555, 458 + i * 37, 94, 17, 11, C.ink, true);
    textBox(s, en, 651, 458 + i * 37, 112, 17, 9, accent, true, F.mono, "right");
  });

  await addPhone(s, IMG.publicPodcastEntry, 846, 76, 164, 356, "Public Agents Pocket Podcast entry");
  await addPhone(s, IMG.answerWaiting, 1045, 76, 164, 356, "Earth Answer waiting for daily reveal");
  smallLabel(s, "SOFTWARE ROUTES", 846, 458, 363, C.black, "#7CFFB0");
  rect(s, 846, 493, 363, 88, C.mint, "#BFD7CB", 1);
  textBox(s, "公共 Agents → 口袋播客", 862, 511, 331, 20, 14, C.greenDark, true, F.sans, "center");
  textBox(s, "私人 Agent → 地球答案", 862, 544, 331, 20, 14, C.greenDark, true, F.sans, "center");
  caption(s, "端侧启动器", 531, 612, 260, C.orange);
  caption(s, "软件入口与实体目录一一对应", 852, 612, 370, C.green);
  notes(s, "Launcher 把日落电台、口袋播客和地球答案放在 home pi 下的三个平行目录里，用户不会落入厂商 Bluetooth、Wi-Fi 或示例 App。按键规则统一为单击移动、长按一秒二进入、快速双击返回。日落电台提供歌曲目录、日落时刻和随机骰子；口袋播客支持播客模式、文字模式与最后有效缓存；地球答案每天零点解锁，只允许回看过去。软件端提供对应入口：公共 Agents 可以进入口袋播客，私人 Agent 可以进入地球答案。三个应用结构解耦，一个应用退出或异常不会影响其他应用。现场默认静音。 ");
}

async function slide29(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "POCKET PODCAST · EDGE SYNC", 50, 72, 292, C.green);
  textBox(s, "服务器每天编排，树莓派只读同步同一版次", 50, 134, 420, 92, 33, C.ink, false);
  textBox(s, "来源、Truth Score 与 recordHash 留在文字模式；端侧不重新总结", 50, 247, 410, 62, 17, C.green, true);
  bodyList(s, [
    "08:20 timer 拉取 podcast/v1",
    "schema validator 检查状态、标题、段落与来源",
    "atomic write 写入缓存；同步失败沿用 last-good",
    "FROST_DISABLE_TTS=1 支持静默验收",
  ], 50, 340, 410, 15, 47);
  callout(s, "冷热记忆沿用知识版次策略。", "完整新闻保留 7 天；入选记录与版次根进入长期精选层。", 50, 542, 405);
  footer(s, 29, "POCKET PODCAST · SOFTWARE + EDGE");

  await addPhone(s, IMG.podcastLedger, 510, 69, 260, 566, "Pocket Podcast text mode source ledger");
  await addPhone(s, IMG.podcastSecond, 839, 69, 260, 566, "Pocket Podcast second verified segment silent preview");
  const y = 577;
  rect(s, 1108, 69, 122, 566, C.white, "#4F5753", 1.25, "rounded-xl", "shadow-md");
  const pipe = [
    ["08:20", "TIMER", C.blue],
    ["GET", "podcast/v1", C.green],
    ["VALID", "SCHEMA", C.purple],
    ["WRITE", "ATOMIC", C.orange],
    ["FALLBACK", "LAST-GOOD", C.coral],
    ["READ", "LAUNCHER", C.teal],
  ];
  pipe.forEach(([a, b, accent], i) => {
    rect(s, 1121, 96 + i * 83, 96, 56, i % 2 ? C.bg : C.mint, C.ink, 0.8);
    textBox(s, a, 1128, 108 + i * 83, 82, 14, 9, accent, true, F.mono, "center");
    textBox(s, b, 1128, 129 + i * 83, 82, 14, 9, C.ink, true, F.mono, "center");
    if (i < pipe.length - 1) arrow(s, "↓", 1149, 153 + i * 83, 40, C.greenDark);
  });
  caption(s, "文字模式 · 来源账本", 516, 648, 300, C.blue);
  caption(s, "播客模式 · 第二条静默预览", 845, 648, 350, C.green);
  notes(s, "口袋播客的软件端与树莓派读取同一份每日数据。服务器每天编排 podcast v1，端侧 timer 在八点二十分拉取；validator 检查 schema、ready 状态、标题、段落以及每段至少两个来源，通过后使用 atomic write 更新缓存。同步失败时继续使用最后一份有效缓存，不会用半份文件覆盖可用版本。文字模式保留来源、Truth Score 与 recordHash，播客模式负责顺序收听和前后切换，树莓派只负责同步与呈现，不在端侧重新总结。完整新闻保留七天，入选记录与版次根进入长期精选层。现场使用 FROST_DISABLE_TTS 等于一做静默验收，不会播放声音。 ");
}

function permissionRow(s, x, y, w, label, body, allowed) {
  rect(s, x, y, w, 59, allowed ? C.mint : C.paleCoral, C.ink, 0.8);
  rect(s, x + 12, y + 18, 22, 22, allowed ? C.green : C.coral, C.ink, 0.8);
  textBox(s, allowed ? "✓" : "×", x + 15, y + 20, 16, 16, 12, C.white, true, F.mono, "center");
  textBox(s, label, x + 47, y + 10, w - 59, 18, 13, C.ink, true, F.mono);
  textBox(s, body, x + 47, y + 32, w - 59, 18, 12, C.muted, false);
}

async function slide30(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "PUBLIC EVENT BRIDGE · SECURITY CONTRACT", 50, 43, 455, C.green);
  textBox(s, "事件合同只开放三类动作，其他数据到不了设备", 50, 91, 1120, 48, 35, C.ink, false);
  textBox(s, "public read → server template → token feed → replay cursor → state / display / tts", 50, 145, 1120, 28, 15, C.green, true, F.mono);

  rect(s, 50, 195, 355, 390, C.white, C.ink, 1.1, null, "shadow-sm");
  rect(s, 50, 195, 355, 42, C.greenDark);
  textBox(s, "ALLOW · 设备可接收", 67, 206, 321, 20, 15, C.white, true, F.mono, "center");
  permissionRow(s, 68, 257, 319, "STATE", "空闲 / 读取 / 播报 / 异常", true);
  permissionRow(s, 68, 328, 319, "DISPLAY", "公开 agentId / revision / root", true);
  permissionRow(s, 68, 399, 319, "TTS", "服务端审核模板生成的 speak", true);
  permissionRow(s, 68, 470, 319, "PUBLIC LINK", "公开交易与区块浏览器链接", true);

  rect(s, 462, 195, 356, 390, C.black, C.black, 0, null, "shadow-sm");
  textBox(s, "JSONL EVENT ENVELOPE", 487, 218, 306, 22, 15, "#7CFFB0", true, F.mono, "center");
  const code = [
    '{',
    '  "eventType": "chain_dispatch",',
    '  "cursor": "evt-20260720-…",',
    '  "agentId": 43,',
    '  "revision": 1,',
    '  "editionRoot": "0x…",',
    '  "actions": [',
    '    "state", "display", "tts"',
    '  ]',
    '}',
  ].join("\n");
  textBox(s, code, 493, 262, 294, 224, 13, C.white, false, F.mono);
  rect(s, 487, 508, 306, 1, "#365046");
  textBox(s, "Bearer token 控制 feed", 490, 527, 300, 18, 12, C.yellow, true, F.mono, "center");
  textBox(s, "cursor 阻止重复播报", 490, 552, 300, 18, 12, C.yellow, true, F.mono, "center");

  rect(s, 875, 195, 355, 390, C.white, C.ink, 1.1, null, "shadow-sm");
  rect(s, 875, 195, 355, 42, C.coral);
  textBox(s, "BLOCK · 设备永不接收", 892, 206, 321, 20, 15, C.white, true, F.mono, "center");
  permissionRow(s, 893, 257, 319, "PRIVATE KEY", "钱包私钥与签名权限", false);
  permissionRow(s, 893, 328, 319, "PRIVATE MEMORY", "私人画像、照片原图、完整对话", false);
  permissionRow(s, 893, 399, 319, "EXACT LOCATION", "现实住址与精确个人坐标", false);
  permissionRow(s, 893, 470, 319, "RAW CHAIN TEXT", "任意链上文本直接送入扬声器", false);

  rect(s, 50, 614, 1180, 43, C.mint, "#BCD8CA", 1);
  textBox(s, "软件、Injective 与硬件通过事件合同解耦；任一侧异常都能独立回退。", 68, 627, 1144, 20, 16, C.greenDark, true, F.sans, "center");
  footer(s, 30, "PUBLIC EVENT BRIDGE · SECURITY CONTRACT");
  notes(s, "事件桥的安全边界由事件合同固定。设备只接收 state、display 和 tts 三类动作，以及必要的公开链接。可以显示的字段包括公开 agentId、revision 与 edition root；可以播报的 speak 文本必须由服务端模板生成。设备永远接收不到钱包私钥、签名权限、私人画像、照片原图、完整对话、现实住址和精确个人坐标，也不会把任意链上文本直接送入扬声器。Bearer token 控制 feed 读取，cursor 防止同一事件重复播报。这样，软件、Injective 与硬件保持解耦，服务器、网络或设备任何一侧异常时都能独立回退。 ");
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  await slide26(p);
  await slide27(p);
  await slide28(p);
  await slide29(p);
  await slide30(p);

  for (const [i, slide] of p.slides.items.entries()) {
    const png = await p.export({ slide, format: "png", scale: 2 });
    await fs.writeFile(path.join(OUT, `slide-${i + 26}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(OUT, `slide-${i + 26}.layout.json`), await layout.text());
  }

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(PPTX);
  console.log(PPTX);
}

await main();

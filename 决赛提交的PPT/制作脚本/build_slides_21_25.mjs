import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const HIRES = path.join(
  PROJECT,
  "决赛提交的PPT",
  "PocketEarth_Injective_决赛产品全景截图库_2026-07-19",
  "14_PPT高清源图_第21-25页_2x",
);
const HARDWARE = path.join(
  PROJECT,
  "决赛提交的PPT",
  "PocketEarth_Injective_决赛产品全景截图库_2026-07-19",
  "09_硬件终端",
);
const OUT = path.join(
  PROJECT,
  "决赛提交的PPT",
  "第21-25页样稿预览-v1-高清无网格底-2026-07-19",
);
const PPTX = path.join(
  PROJECT,
  "决赛提交的PPT",
  "Pocket Earth on Injective-决赛路演PPT-第21-25页样稿-v1-高清无网格底-2026-07-19.pptx",
);

const IMG = {
  podcast: path.join(HIRES, "01_口袋播客每日主持_2x.png"),
  finance: path.join(HIRES, "02_金融知识便签展开_2x.png"),
  science: path.join(HIRES, "03_科学知识完整证据_2x.png"),
  editionTx: path.join(HIRES, "04_知识版次Blockscout成功_2x.png"),
  frost47: path.join(HIRES, "05_Frost身份卡47北欧极光客_2x.png"),
  podcastText: path.join(HIRES, "06_口袋播客文字模式_2x.png"),
  policy: path.join(HIRES, "07_政策知识便签展开_2x.png"),
  residence47Tx: path.join(HIRES, "08_PublicEarth47门牌Blockscout成功_2x.png"),
  hwLauncher: path.join(HARDWARE, "06_树莓派真机启动器.jpg"),
  hwAgentMenu: path.join(HARDWARE, "07_树莓派真机口袋知识菜单.jpg"),
  hwKnowledge: path.join(HARDWARE, "08_树莓派真机知识播报.jpg"),
  hwDice: path.join(HARDWARE, "09_树莓派真机随机骰子.jpg"),
  edgePodcast: path.join(HARDWARE, "02_口袋播客双模式.png"),
  edgePodcastText: path.join(HARDWARE, "03_口袋播客文字预览.png"),
  edgeAnswer: path.join(HARDWARE, "04_地球答案端侧界面.png"),
};

const C = {
  bg: "#F4F5F2",
  ink: "#171918",
  muted: "#666D69",
  soft: "#8B918D",
  green: "#21936D",
  greenDark: "#2A604F",
  mint: "#E2F1EA",
  cyan: "#18C6DD",
  blue: "#2D62DD",
  paleBlue: "#E6F0FF",
  cream: "#F7F2E6",
  white: "#FFFFFF",
  black: "#0C0F0E",
  yellow: "#F4C84A",
  paleYellow: "#FFF2CC",
  purple: "#8F70DC",
  palePurple: "#EEE8FA",
  orange: "#F28A4B",
  paleOrange: "#FBE7D8",
  coral: "#EF766D",
  paleCoral: "#F8E1DE",
  teal: "#39B9AD",
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

function callout(slide, title, body, x = 50, y = 520, w = 394) {
  rect(slide, x, y, w, 91, C.mint, "#C6DBD1", 1);
  rect(slide, x, y, 5, 91, C.green);
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

function arrow(slide, text, x, y, w = 42, color = C.green) {
  textBox(slide, text, x, y, w, 30, 21, color, true, F.mono, "center");
}

async function slide21(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "FROST EDGE NODE", 50, 76, 205, C.green);
  textBox(s, "链上身份进入房间，\n公开见闻变成灯光、画面和声音", 50, 142, 430, 100, 32, C.ink, false);
  textBox(s, "Raspberry Pi 5 + Whisplay HAT · 240×280 · RGB · buttons · mic · speaker", 50, 265, 418, 56, 16, C.green, true);
  bodyList(s, [
    "屏幕显示公开身份、知识与版次状态",
    "RGB 用颜色提示空闲、读取、播报与异常",
    "本地 TTS 具备离线降级；手机镜像放大现场画面",
  ], 50, 342, 410, 15, 55);
  callout(s, "硬件的价值在于身份与在场感。", "同一个 Frost 在 App、公共地球和房间里保持可识别。", 50, 535, 404);
  footer(s, 21, "FROST EDGE NODE");

  await addImage(s, IMG.hwKnowledge, 510, 72, 370, 548, "Frost Edge Node real hardware showing verified knowledge", "cover");
  await addPhone(s, IMG.podcast, 948, 72, 252, 548, "Pocket Podcast daily host software interface");
  caption(s, "真机 · Whisplay 屏幕与 RGB 状态", 518, 638, 360, C.green);
  caption(s, "软件镜像 · 同一知识版次可读可听", 936, 638, 300, C.blue);
  notes(s, "这一页请直接指向台上的 Frost Edge Node。它由 Raspberry Pi 5 和 Whisplay HAT 组成，包含 240×280 屏幕、RGB 灯、按键、麦克风和扬声器。公开身份、知识版次和链上见闻可以出现在屏幕上，RGB 表达运行状态，本地 TTS 负责播报，网络不可用时可降级到离线语音，手机镜像让现场观众看清小屏。白天，Frost 以链上身份去公共地球；夜里，它把经过验证的世界带回房间。本页只展示当前实体原型与真实软件能力，不讨论量产、收藏或硬件销售。现场保持静音，明确触发后再播放声音。 ");
}

async function slide22(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "PUBLIC EVENT BRIDGE", 50, 43, 238, C.green);
  textBox(s, "只读公开证据，白名单动作驱动物理反馈", 50, 91, 980, 48, 36, C.ink, false);
  textBox(s, "Injective → JSONL envelope → token feed → replay cursor → event adapter → Whisplay", 50, 146, 1120, 30, 16, C.green, true, F.mono);

  const stages = [
    { n: "01", title: "INJECTIVE READ", zh: "实时读取公开身份、门牌与版次", fill: C.paleBlue, accent: C.blue },
    { n: "02", title: "ALLOWLIST ENVELOPE", zh: "服务端生成受控 JSONL 事件", fill: C.mint, accent: C.green },
    { n: "03", title: "TOKEN FEED", zh: "设备令牌限制读取入口", fill: C.cream, accent: C.orange },
    { n: "04", title: "REPLAY CURSOR", zh: "游标阻止同一事件重复播放", fill: C.palePurple, accent: C.purple },
    { n: "05", title: "PI ADAPTER", zh: "只接受 state / display / tts", fill: C.paleCoral, accent: C.coral },
    { n: "06", title: "WHISPLAY OUTPUT", zh: "屏幕、RGB、TTS 与手机镜像", fill: C.mint, accent: C.teal },
  ];
  stages.forEach((c, i) => {
    const x = 50 + i * 198;
    rect(s, x, 208, 172, 230, c.fill, C.ink, 1.2, null, "shadow-sm");
    rect(s, x, 208, 172, 42, c.accent);
    textBox(s, c.n, x + 11, 219, 36, 19, 12, C.white, true, F.mono, "center");
    textBox(s, c.title, x + 45, 219, 117, 18, 10, C.white, true, F.mono, "center");
    textBox(s, c.zh, x + 20, 281, 132, 64, 15, C.ink, true, F.sans, "center");
    rect(s, x + 20, 365, 132, 1, "#AAB0AC");
    const foot = ["PUBLIC READ", "SERVER TEMPLATE", "BEARER", "NO REPLAY", "NO RAW TEXT", "PHYSICAL FEEDBACK"][i];
    textBox(s, foot, x + 14, 388, 144, 19, 10, c.accent, true, F.mono, "center");
    if (i < stages.length - 1) arrow(s, "→", x + 174, 304, 24, C.greenDark);
  });

  rect(s, 50, 474, 1180, 112, C.black, C.black, 0, "rounded-md", "shadow-md");
  textBox(s, "DEVICE BOUNDARY", 72, 493, 184, 24, 17, "#7CFFB0", true, F.mono);
  textBox(s, "设备不持有私钥 · 不发起钱包签名 · 不接收私人画像 · 不保存精确位置", 274, 493, 912, 26, 18, C.white, true);
  rect(s, 72, 537, 1114, 1, "#365046");
  textBox(s, "speak 文本由服务端模板生成；任意链上文本不会直接送入扬声器。", 72, 552, 1114, 22, 14, "#C9D6D0", false, F.sans, "center");
  textBox(s, "软件、链上与硬件通过事件合同解耦；任何一侧都能独立回退。", 50, 620, 1180, 24, 18, C.greenDark, true, F.sans, "center");
  notes(s, "事件桥坚持只读和最小权限。服务端先实时读取 Injective 上的公开证据，再按照白名单生成 JSONL 事件；token 控制设备读取 feed，cursor 防止历史事件重播。树莓派适配器只接受 state、display 和 tts 三类动作，speak 内容由服务端模板生成，设备不会把任意链上文本直接念出来。设备端没有私钥、钱包签名、私人画像、照片原图和精确位置。软件、链上与硬件通过事件合同解耦，网络、模型或设备任一侧异常时都能独立回退。 ");
}

async function appCard(slide, img, x, y, title, body, accent, type = "image/png") {
  rect(slide, x, y, 350, 145, C.white, C.ink, 1.1, null, "shadow-sm");
  slide.images.add({
    blob: await bytes(img),
    contentType: type,
    alt: title,
    fit: "cover",
    position: { left: x + 10, top: y + 10, width: 128, height: 125 },
    geometry: "rect",
  });
  rect(slide, x + 152, y + 20, 8, 8, accent);
  textBox(slide, title, x + 171, y + 12, 162, 28, 17, C.ink, true);
  textBox(slide, body, x + 171, y + 50, 162, 62, 13, C.muted, false);
}

async function slide23(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "POCKET EARTH LAUNCHER", 50, 55, 252, C.green);
  textBox(s, "音乐、知识与行动提示，\n共用一套清楚的桌面交互", 50, 110, 420, 94, 33, C.ink, false);
  textBox(s, "单击移动 · 长按 1.2 秒进入 · 快速双击返回", 50, 225, 420, 34, 17, C.green, true);
  bodyList(s, [
    "日落电台：歌曲目录、日落时刻、随机骰子",
    "口袋播客：每日版次可听，也保留文字阅读",
    "地球答案：00:00 解锁，可回看过去",
    "静默首页：时间、日期、连接状态与今日一页",
  ], 50, 300, 400, 15, 49);
  callout(s, "统一手势，减少现场记忆成本。", "默认静音；声音只在用户明确进入播报时触发。", 50, 528, 404);
  footer(s, 23, "POCKET EARTH LAUNCHER");

  await addImage(s, IMG.hwLauncher, 500, 92, 290, 526, "Frost Edge Node launcher with three projects", "cover");
  smallLabel(s, "/home/pi · 三个平行入口", 522, 105, 246, C.black, "#7CFFB0");
  await appCard(s, IMG.edgePodcast, 840, 92, "口袋播客", "播客模式 / 文字模式\n知识版次共用一套入口", C.green);
  await appCard(s, IMG.hwDice, 840, 251, "随机骰子", "轻触滚动选择\n长按进入歌曲", C.orange, "image/jpeg");
  await appCard(s, IMG.edgeAnswer, 840, 410, "地球答案", "今日行动提示\n未来日期保持锁定", C.blue);
  caption(s, "真机启动器 · 日落电台 / 口袋播客 / 地球答案", 514, 635, 690, C.green);
  notes(s, "端侧启动器把三个项目放在同一级：日落电台、口袋播客和地球答案。手势统一为单击移动、长按一秒二进入、快速双击返回。日落电台包含歌曲目录、日落时刻和随机骰子；口袋播客把当日知识版次组织成可听内容，同时保留文字模式；地球答案每天零点解锁一条经过审阅的行动提示，只能回看过去。静默首页显示时间、日期和连接状态。现场默认静音，只有明确进入播报才触发声音。自动生成长期播客语感仍在持续完善，决赛展示使用已经准备和核验的真实版次。 ");
}

async function sceneCard(slide, item, i) {
  const x = 50 + i * 199;
  rect(slide, x, 169, 174, 382, C.white, C.ink, 1.1, null, "shadow-sm");
  rect(slide, x, 169, 174, 36, item.accent);
  textBox(slide, item.time, x + 10, 178, 62, 18, 10, C.white, true, F.mono, "center");
  textBox(slide, item.step, x + 72, 178, 92, 18, 10, C.white, true, F.mono, "center");
  if (item.phone) {
    slide.images.add({
      blob: await bytes(item.img),
      contentType: contentType(item.img),
      alt: item.title,
      fit: "cover",
      position: { left: x + 10, top: 216, width: 154, height: 248 },
      geometry: "rect",
    });
  } else {
    rect(slide, x + 10, 216, 154, 248, C.cream, "none", 0);
    slide.images.add({
      blob: await bytes(item.img),
      contentType: contentType(item.img),
      alt: item.title,
      fit: "contain",
      position: { left: x + 13, top: 239, width: 148, height: 202 },
      geometry: "rect",
    });
  }
  textBox(slide, item.title, x + 12, 479, 150, 26, 14, C.ink, true, F.sans, "center");
  textBox(slide, item.sub, x + 12, 513, 150, 25, 11, C.muted, false, F.sans, "center");
  if (i < 5) arrow(slide, "→", x + 176, 354, 21, C.greenDark);
}

async function slide24(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "LIVE DEMO", 50, 43, 128, C.green);
  textBox(s, "一条公开知识，走完整条证据与物理反馈路径", 50, 91, 1000, 48, 35, C.ink, false);
  textBox(s, "Discover → Verify → Approve / Commit → Read → Echo / Mirror", 50, 143, 900, 28, 16, C.green, true, F.mono);
  smallLabel(s, "OFFLINE EVIDENCE READY", 1015, 91, 215, C.black, C.yellow);

  const items = [
    { time: "00–10s", step: "DISCOVER", title: "公开信号", sub: "真实地点与来源", img: IMG.finance, phone: true, accent: C.blue },
    { time: "10–20s", step: "VERIFY", title: "交叉核验", sub: "全文与核验路径", img: IMG.science, phone: true, accent: C.purple },
    { time: "20–30s", step: "APPROVE", title: "批准并提交", sub: "revision / root", img: IMG.editionTx, phone: true, accent: C.green },
    { time: "30–40s", step: "READ", title: "公开身份", sub: "Frost #47", img: IMG.frost47, phone: true, accent: C.orange },
    { time: "40–50s", step: "ECHO", title: "端侧反馈", sub: "屏幕 / RGB / TTS", img: IMG.edgePodcastText, phone: false, accent: C.teal },
    { time: "50–55s", step: "MIRROR", title: "软件镜像", sub: "同一版次文字页", img: IMG.podcastText, phone: true, accent: C.coral },
  ];
  for (let i = 0; i < items.length; i += 1) await sceneCard(s, items[i], i);

  rect(s, 50, 579, 1180, 60, C.black, C.black, 0, "rounded-md", "shadow-md");
  textBox(s, "SOURCE", 72, 598, 92, 20, 12, "#7CFFB0", true, F.mono);
  textBox(s, "→ RESOURCE PACK → INJECTIVE ROOT → PUBLIC EVENT → FROST EDGE NODE", 164, 598, 850, 20, 15, C.white, true, F.mono);
  smallLabel(s, "BACKUP VIDEO", 1037, 596, 166, C.greenDark, C.white);
  textBox(s, "同一条事实，从来源、资源包、Injective 一直走到现实房间。", 50, 651, 1180, 24, 18, C.greenDark, true, F.sans, "center");
  notes(s, "现场演示用五十五秒走完一条公开知识路径：先从公共地球打开真实新闻卡，展开来源与核验路径；读取 recordHash、Merkle proof 和当日 revision；在 Blockscout 核对 DailyKnowledgeChronicle 的成功交易；再读取 Frost 的公开身份并触发受控事件，Edge Node 的屏幕与 RGB 给出反馈，最后用手机镜像放大同一画面。现场网络或设备状态不稳定时，立即切换已经准备的离线证据与备份录像，清楚说明这是同一条端到端路径的录制证据。不要临场宣称尚未完成的实时联调结果。 ");
}

async function slide25(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "POCKET EARTH ON INJECTIVE", 50, 65, 285, C.green);
  textBox(s, "把人生放回空间，\n把公共知识交给时间证明", 50, 126, 430, 100, 34, C.ink, false);
  textBox(s, "一颗私人地球 · 一个公开 Agent 世界 · 一台房间里的 Frost", 50, 250, 415, 62, 17, C.green, true);

  const values = [
    ["SPACE", "空间", "记忆与知识回到真实地点"],
    ["TRUST", "信任", "身份、门牌和版次可公开复核"],
    ["PRESENCE", "在场", "同一个 Frost 从软件走进房间"],
  ];
  values.forEach(([en, zh, body], i) => {
    const y = 340 + i * 72;
    rect(s, 50, y, 102, 49, i === 1 ? C.greenDark : C.black);
    textBox(s, en, 55, y + 15, 92, 18, 10, i === 1 ? C.white : "#7CFFB0", true, F.mono, "center");
    textBox(s, zh, 170, y + 3, 64, 22, 17, C.ink, true);
    textBox(s, body, 242, y + 3, 218, 42, 14, C.muted, false);
  });
  rect(s, 50, 576, 410, 54, C.mint, "#BDD8CB", 1);
  textBox(s, "pocketearth-injective.throughtheglass.art", 65, 593, 380, 20, 13, C.greenDark, true, F.mono, "center");
  footer(s, 25, "POCKET EARTH ON INJECTIVE");

  await addPhone(s, IMG.policy, 505, 92, 214, 465, "Public Earth policy knowledge signal card");
  await addPhone(s, IMG.residence47Tx, 763, 92, 214, 465, "Injective Blockscout successful Public Earth residence transaction");
  rect(s, 1021, 92, 208, 465, C.white, "#4F5753", 1.25, "rounded-xl", "shadow-md");
  smallLabel(s, "FROST EDGE NODE", 1041, 113, 168, C.black, "#7CFFB0");
  s.images.add({
    blob: await bytes(IMG.hwAgentMenu),
    contentType: "image/jpeg",
    alt: "Frost Edge Node physical hardware showing Pocket Earth menu",
    fit: "cover",
    position: { left: 1034, top: 153, width: 182, height: 243 },
    geometry: "roundRect",
    borderRadius: "rounded-lg",
  });
  rect(s, 1034, 153, 182, 243, "none", C.ink, 1, "rounded-lg");
  textBox(s, "公开身份与知识菜单\n在房间里保持可见", 1041, 423, 168, 48, 14, C.ink, true, F.sans, "center");
  textBox(s, "DISPLAY · RGB · BUTTONS", 1041, 489, 168, 18, 10, C.orange, true, F.mono, "center");
  caption(s, "公共地球", 508, 576, 200, C.blue);
  caption(s, "Injective 证据", 766, 576, 205, C.green);
  caption(s, "Frost Edge Node", 1024, 576, 205, C.orange);
  rect(s, 505, 625, 724, 33, C.black);
  textBox(s, "口袋地球装记忆，公共地球住分身。谢谢。", 515, 634, 704, 17, 14, C.white, true, F.sans, "center");
  notes(s, "Pocket Earth 最终形成三层体验：私人地球保存个人空间记忆，公共地球让知识 Agent 和公开身份形成一个可以复核的世界，Frost Edge Node 把公开见闻带回房间。它的价值可以归纳为三个词：Space，让记忆和知识回到真实地点；Trust，让身份、门牌和版次能够在 Injective 上公开复核；Presence，让同一个 Frost 从 App、公共地球和身份卡延伸到实体设备。最后一句请放慢速度：口袋地球装记忆，公共地球住分身。谢谢。 ");
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  await slide21(p);
  await slide22(p);
  await slide23(p);
  await slide24(p);
  await slide25(p);

  for (const [i, slide] of p.slides.items.entries()) {
    const png = await p.export({ slide, format: "png", scale: 2 });
    await fs.writeFile(path.join(OUT, `slide-${i + 21}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(OUT, `slide-${i + 21}.layout.json`), await layout.text());
  }

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(PPTX);
  console.log(PPTX);
}

await main();

import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const HIRES = path.join(
  PROJECT,
  "决赛提交的PPT",
  "PocketEarth_Injective_决赛产品全景截图库_2026-07-19",
  "13_PPT高清源图_第16-20页_2x",
);
const OUT = path.join(
  PROJECT,
  "决赛提交的PPT",
  "第16-20页样稿预览-v1-高清无网格底-2026-07-19",
);
const PPTX = path.join(
  PROJECT,
  "决赛提交的PPT",
  "Pocket Earth on Injective-决赛路演PPT-第16-20页样稿-v1-高清无网格底-2026-07-19.pptx",
);

const IMG = {
  proof: path.join(HIRES, "01_AI版次验证记录与Merkle证明_2x.png"),
  handshakePage: path.join(HIRES, "02_Injective证据页真实握手_2x.png"),
  blockscoutSuccess: path.join(HIRES, "03_Blockscout握手交易成功_2x.png"),
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
  azure: "#0078D4",
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
  teal: "#39B9AD",
};

const F = { sans: "PingFang SC", mono: "Arial" };

async function bytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
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

function bodyList(slide, lines, x, y, w, size = 16) {
  lines.forEach((line, i) => {
    rect(slide, x, y + i * 50 + 8, 7, 7, i === 0 ? C.green : "#A8AFAB");
    textBox(slide, line, x + 18, y + i * 50, w - 18, 44, size, C.muted, false);
  });
}

function callout(slide, title, body, x = 50, y = 520, w = 394) {
  rect(slide, x, y, w, 91, C.mint, "#C6DBD1", 1);
  rect(slide, x, y, 5, 91, C.green);
  textBox(slide, title, x + 18, y + 14, w - 35, 24, 17, C.greenDark, true);
  textBox(slide, body, x + 18, y + 47, w - 35, 34, 13, C.muted, false);
}

async function addPhone(slide, imgPath, x, y, w = 244, h = 528, alt = "Pocket Earth mobile interface") {
  rect(slide, x + 7, y + 9, w, h, "#D9DDDA", "none", 0, "rounded-xl", "shadow-md");
  slide.images.add({
    blob: await bytes(imgPath),
    contentType: "image/png",
    alt,
    fit: "cover",
    position: { left: x, top: y, width: w, height: h },
    geometry: "roundRect",
    borderRadius: "rounded-xl",
  });
  rect(slide, x, y, w, h, "none", "#4F5753", 1.25, "rounded-xl");
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

async function slide16(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "DAILY RUN · HOT / COLD MEMORY", 50, 43, 322, C.green);
  textBox(s, "过程保留七天，精选版次长期存在", 50, 91, 900, 48, 36, C.ink, false);
  textBox(s, "北京时间 08:10 自动发现与核验，人工批准后显式提交", 50, 146, 920, 30, 17, C.green, true);

  const stages = [
    ["08:10", "SCHEDULE"],
    ["发现", "DISCOVERY"],
    ["去重", "DE-DUP"],
    ["直达来源", "DIRECT SOURCE"],
    ["调查 / 质疑", "DUAL REVIEW"],
    ["人工批准", "REVIEW REQUIRED"],
  ];
  stages.forEach(([zh, en], i) => {
    const x = 50 + i * 199;
    const fill = i === 5 ? C.paleYellow : i === 0 ? C.black : C.white;
    const line = i === 5 ? C.yellow : C.ink;
    rect(s, x, 205, 166, 64, fill, line, 1.2, null, "shadow-sm");
    textBox(s, zh, x + 10, 216, 146, 22, 16, i === 0 ? C.white : C.ink, true, F.sans, "center");
    textBox(s, en, x + 8, 243, 150, 15, 9, i === 0 ? "#7CFFB0" : C.soft, true, F.mono, "center");
    if (i < stages.length - 1) arrow(s, "→", x + 167, 224, 31);
  });

  const layers = [
    { x: 50, n: "L1", title: "运行态", body: "调用状态 · 预算 · 当轮信号", foot: "当轮结束即可释放", fill: C.paleBlue, accent: C.blue },
    { x: 450, n: "L2", title: "七日热缓存", body: "候选 · 失败原因 · 草稿 · RunTrace", foot: "DAY 7 自动清理完整过程", fill: C.palePurple, accent: C.purple },
    { x: 850, n: "L3", title: "长期精选", body: "来源 · recordHash · proof · editionRoot", foot: "批准版次与交易继续保留", fill: C.mint, accent: C.green },
  ];
  layers.forEach((c) => {
    rect(s, c.x, 323, 366, 176, c.fill, C.ink, 1.2, null, "shadow-sm");
    rect(s, c.x, 323, 66, 176, c.accent);
    textBox(s, c.n, c.x, 376, 66, 35, 21, C.white, true, F.mono, "center");
    textBox(s, c.title, c.x + 88, 346, 244, 28, 21, C.ink, true);
    textBox(s, c.body, c.x + 88, 387, 247, 47, 15, C.muted, false);
    rect(s, c.x + 88, 446, 245, 1, "#AAB0AC");
    textBox(s, c.foot, c.x + 88, 458, 247, 28, 12, c.accent, true);
  });
  arrow(s, "→", 416, 390, 31);
  arrow(s, "→", 816, 390, 31);

  rect(s, 50, 536, 1180, 68, C.black, C.black, 0, "rounded-md", "shadow-md");
  textBox(s, "DAY 7", 72, 553, 96, 25, 17, "#7CFFB0", true, F.mono);
  textBox(s, "完整工作区清理", 176, 553, 204, 25, 17, C.white, true);
  arrow(s, "→", 393, 550, 45, "#7CFFB0");
  textBox(s, "人工批准的知识、证明与 Injective 版次继续存在", 455, 553, 640, 25, 17, C.white, true);
  smallLabel(s, "SIGNED ACTION IS SEPARATE", 1006, 548, 194, C.greenDark, C.white);
  textBox(s, "记忆的价值来自压缩、巩固、检索和有边界的遗忘。", 50, 625, 1180, 24, 18, C.greenDark, true, F.sans, "center");
  notes(s, "每天北京时间八点十分，worker 自动发现、去重、取直接来源，并让调查方和质疑方交叉检查。所有候选先进入七日热缓存，保留失败原因和运行轨迹。人工批准后才形成长期版次并提交 Injective。七天之后，完整工作过程清理，经过批准的知识和证明继续保留。自动发现可以无人值守，公开承诺始终保留人工确认。当前使用原子 JSON 与目录分层保存，不把它说成传统数据库。 ");
}

async function slide17(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "VERIFIABLE EDITION", 50, 76, 214, C.green);
  textBox(s, "正文留在资源包，\n版次根写入 Injective", 50, 146, 410, 98, 37, C.ink, false);
  textBox(s, "每次修订产生新的 revision，旧版根继续可查", 50, 269, 420, 58, 18, C.green, true);
  bodyList(s, [
    "recordHash：固定一条知识的精确快照",
    "Merkle proof：证明它属于当日版次",
    "editionRoot：整批批准知识的公开指纹",
  ], 50, 350, 405, 16);
  callout(s, "内容保持丰富，链上承诺保持最小。", "客户端本地重算，再与 Injective 公开读回结果比较。", 50, 520, 394);
  footer(s, 17, "VERIFIABLE EDITION");

  const flowX = 496;
  const flow = [
    ["01", "知识记录", "正文 · 来源 · 日期 · 分数", C.paleBlue, C.blue],
    ["02", "recordHash", "对精确快照做承诺", C.palePurple, C.purple],
    ["03", "Merkle proof", "沿路径重算当天根", C.cream, C.orange],
    ["04", "Injective revision", "比较 editionRoot 与修订", C.mint, C.green],
  ];
  flow.forEach(([n, title, sub, fill, accent], i) => {
    const y = 116 + i * 118;
    rect(s, flowX, y, 276, 84, fill, C.ink, 1.1, null, "shadow-sm");
    rect(s, flowX, y, 50, 84, accent);
    textBox(s, n, flowX, y + 28, 50, 24, 14, C.white, true, F.mono, "center");
    textBox(s, title, flowX + 68, y + 13, 184, 24, 17, C.ink, true, F.mono);
    textBox(s, sub, flowX + 68, y + 44, 184, 27, 12, C.muted, false);
    if (i < flow.length - 1) arrow(s, "↓", flowX + 118, y + 87, 40);
  });
  rect(s, 496, 600, 276, 42, C.black);
  textBox(s, "LOCAL RECOMPUTE = VERIFIED", 504, 612, 260, 18, 11, "#7CFFB0", true, F.mono, "center");

  await addPhone(s, IMG.proof, 895, 72, 252, 548, "Daily knowledge edition with verified Merkle proof");
  caption(s, "验证记录 · 本地重算 1 层路径并得到同一根", 858, 638, 370, C.green);
  notes(s, "每条批准记录都会生成 recordHash，并成为当天 Merkle 树的一片叶子。资源包保存正文、来源和 inclusion proof；Injective 只保存 editionRoot 与 revision。任何客户端都能重新计算 recordHash、沿 proof 得到根，再读取 Injective 上的同日版本完成比较。修订会产生新 revision，旧根继续可查。这里说的是每日知识版次，不是另外造一条链，也不把正文写进链上。 ");
}

async function slide18(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "WHY INJECTIVE", 50, 43, 170, C.green);
  textBox(s, "概率性的 Agent，需要确定性的公开锚点", 50, 91, 930, 48, 36, C.ink, false);
  textBox(s, "Agent 在链下理解与创造，Injective 保存身份、门牌、版本和公开事件", 50, 146, 1050, 30, 17, C.green, true);

  rect(s, 496, 274, 288, 120, C.black, C.green, 2, "rounded-md", "shadow-md");
  textBox(s, "INJECTIVE EVM", 516, 301, 248, 32, 24, "#7CFFB0", true, F.mono, "center");
  textBox(s, "PUBLIC READ · TESTNET EVIDENCE", 516, 348, 248, 18, 10, C.white, true, F.mono, "center");

  const anchors = [
    { x: 50, y: 215, title: "WHO · 身份", code: "ERC-8004", body: "哪个公开 Agent", fill: C.paleBlue, accent: C.blue, arrow: "→" },
    { x: 894, y: 215, title: "WHERE · 门牌", code: "PublicEarthRegistry", body: "它住在公共地球哪里", fill: C.mint, accent: C.green, arrow: "←" },
    { x: 50, y: 430, title: "WHEN / VERSION", code: "DailyKnowledgeChronicle", body: "哪一天、哪一次修订", fill: C.cream, accent: C.orange, arrow: "→" },
    { x: 894, y: 430, title: "WHO MET WHOM", code: "SocialHandshake", body: "哪些分身公开相遇", fill: C.palePurple, accent: C.purple, arrow: "←" },
  ];
  anchors.forEach((c) => {
    rect(s, c.x, c.y, 336, 138, c.fill, C.ink, 1.2, null, "shadow-sm");
    rect(s, c.x, c.y, 9, 138, c.accent);
    textBox(s, c.title, c.x + 27, c.y + 17, 280, 22, 16, C.ink, true, F.mono);
    textBox(s, c.code, c.x + 27, c.y + 54, 280, 24, 15, c.accent, true, F.mono);
    textBox(s, c.body, c.x + 27, c.y + 93, 280, 25, 14, C.muted, false);
    arrow(s, c.arrow, c.x < 500 ? c.x + 352 : c.x - 59, c.y + 51, 42, c.accent);
  });

  smallLabel(s, "CHAIN-OFF AGENTS", 516, 213, 130, C.white, C.greenDark);
  smallLabel(s, "DETERMINISTIC ANCHORS", 652, 213, 174, C.greenDark, C.white);
  rect(s, 50, 610, 1180, 44, C.mint, "#BDD8CB", 1);
  textBox(s, "Injective 给变化的 Agent 提供稳定的身份与时间证据。", 70, 622, 1140, 22, 18, C.greenDark, true, F.sans, "center");
  notes(s, "Agent 会受模型、来源和上下文影响，所以它需要一组稳定的公开锚点。我们在 Injective 上固定四类事实：ERC-8004 回答身份，PublicEarthRegistry 记录象征门牌，DailyKnowledgeChronicle 记录每日版次与修订，SocialHandshake 记录公开分身之间的相遇。Injective 让这些事实可以跨客户端核对。链上只保存公开、最小、可验证的事实。 ");
}

async function slide19(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "LIVE INJECTIVE EVIDENCE", 50, 76, 250, C.green);
  textBox(s, "身份、门牌、握手与知识版次\n都能从产品追到交易", 50, 142, 420, 99, 33, C.ink, false);
  textBox(s, "界面 → API → event / calldata → contract → Blockscout", 50, 270, 420, 54, 17, C.green, true);
  bodyList(s, [
    "Frost #43–47 · 5 个公开身份",
    "PublicEarthRegistry · 5 个象征门牌",
    "SocialHandshake · #43 ↔ #44 · score 88",
    "Chronicle · 20260717 · revision 2 · 2 facts",
  ], 50, 342, 415, 15);
  callout(s, "同一条证据有两种入口。", "产品内查看；离开产品后仍能在 Injective 浏览器复核。", 50, 545, 394);
  footer(s, 19, "LIVE INJECTIVE EVIDENCE");

  await addPhone(s, IMG.handshakePage, 500, 72, 252, 548, "Pocket Earth Injective evidence page with real handshake");
  await addPhone(s, IMG.blockscoutSuccess, 924, 72, 252, 548, "Injective Blockscout successful SocialHandshake transaction");
  caption(s, "证据页 · #43–47 身份与 score 88 握手", 503, 638, 320, C.purple);
  caption(s, "Blockscout · Success、区块、时间与合约", 927, 638, 315, C.green);
  notes(s, "这里展示的是当前真实测试网证据。Frost 已有 #43 到 #47 五个身份，PublicEarthRegistry 有五个象征门牌，#43 与 #44 完成了一次 score 88 的公开握手，DailyKnowledgeChronicle 已记录 20260717 的 revision 2。每一项都能从产品继续点到 API、事件、合约和 Blockscout。完整地址放在备份页，主屏只保留易读的短地址和事实。 ");
}

async function slide20(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "MICROSOFT AZURE · MODEL INFRASTRUCTURE", 50, 43, 392, C.azure);
  textBox(s, "一个模型入口，按任务选择合适能力", 50, 91, 900, 48, 36, C.ink, false);
  textBox(s, "端侧负责意图、检索与隐私敏感视觉；云端负责综合、叙事与长文本生成", 50, 146, 1120, 30, 17, C.azure, true);

  const cols = [
    { x: 50, w: 310, fill: C.paleBlue, accent: C.cyan, head: "DEVICE SELECTOR", title: "端侧先判断", lines: ["意图预分类", "本地检索", "隐私敏感视觉", "无需云端的任务直接完成"] },
    { x: 478, w: 324, fill: C.cream, accent: C.green, head: "PROVIDER ADAPTER", title: "统一模型契约", lines: ["request / response", "retry / timeout", "fallback", "providerResult 结构保持一致"] },
    { x: 920, w: 310, fill: "#E7F2FB", accent: C.azure, head: "MICROSOFT FOUNDRY", title: "Model Router", lines: ["单一部署入口", "逐请求选择模型", "返回实际 model", "按模式平衡质量与成本"] },
  ];
  cols.forEach((c, i) => {
    rect(s, c.x, 220, c.w, 302, c.fill, C.ink, 1.25, null, "shadow-sm");
    rect(s, c.x, 220, c.w, 48, c.accent);
    textBox(s, c.head, c.x + 14, 234, c.w - 28, 20, 14, C.white, true, F.mono, "center");
    textBox(s, c.title, c.x + 24, 291, c.w - 48, 30, 22, C.ink, true, F.sans, "center");
    c.lines.forEach((line, j) => {
      rect(s, c.x + 24, 348 + j * 38, 7, 7, j === 0 ? c.accent : "#A8AFAB");
      textBox(s, line, c.x + 42, 340 + j * 38, c.w - 66, 28, 15, C.muted, false);
    });
    if (i < cols.length - 1) arrow(s, "→", c.x + c.w + 27, 350, 65, i === 0 ? C.green : C.azure);
  });

  rect(s, 50, 558, 760, 62, C.black, C.black, 0, "rounded-md");
  textBox(s, "RUNTRACE", 72, 576, 126, 24, 17, "#7CFFB0", true, F.mono);
  textBox(s, "provider · model · latency · retry · fallback reason", 208, 576, 560, 24, 16, C.white, true, F.mono);
  rect(s, 835, 548, 395, 82, C.paleYellow, C.yellow, 1.2, null, "shadow-sm");
  smallLabel(s, "STRICT LIVE GATE", 854, 562, 150, C.black, C.yellow);
  textBox(s, "PENDING FINAL ACCOUNT VERIFICATION", 1015, 566, 195, 18, 10, C.ink, true, F.mono, "center");
  textBox(s, "通过后展示真实 HTTP 2xx · model · Azure request ID", 854, 596, 356, 20, 12, C.muted, false, F.sans, "center");
  textBox(s, "Injective 管公开信任，Azure 管模型基础设施，两条轴在 Frost Harness 汇合。", 50, 646, 1180, 22, 17, C.greenDark, true, F.sans, "center");
  notes(s, "Azure 位于模型基础设施这一层。端侧先处理意图、检索和隐私敏感任务，统一 provider adapter 再把需要云端推理的请求交给 Microsoft Foundry Model Router。它提供一个部署入口，并按任务选择合适模型。RunTrace 记录实际 provider、model、耗时和降级原因。真实请求通过严格验收后，我们再展示 2xx 与 request ID。当前已完成 provider adapter、离线契约验证和严格真实请求脚本；赛前配置真实账号、endpoint、deployment 与 key 后运行 strict live。Microsoft 官方说明：https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/model-router 。");
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  await slide16(p);
  await slide17(p);
  await slide18(p);
  await slide19(p);
  await slide20(p);

  for (const [i, slide] of p.slides.items.entries()) {
    const png = await p.export({ slide, format: "png", scale: 2 });
    await fs.writeFile(path.join(OUT, `slide-${i + 16}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(OUT, `slide-${i + 16}.layout.json`), await layout.text());
  }

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(PPTX);
  console.log(PPTX);
}

await main();

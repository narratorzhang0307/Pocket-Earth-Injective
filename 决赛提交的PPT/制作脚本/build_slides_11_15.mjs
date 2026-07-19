import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const HIRES = path.join(
  PROJECT,
  "决赛提交的PPT",
  "PocketEarth_Injective_决赛产品全景截图库_2026-07-19",
  "12_PPT高清源图_第11-15页_2x",
);
const OUT = path.join(
  PROJECT,
  "决赛提交的PPT",
  "第11-15页样稿预览-v1-高清无网格底-2026-07-19",
);
const PPTX = path.join(
  PROJECT,
  "决赛提交的PPT",
  "Pocket Earth on Injective-决赛路演PPT-第11-15页样稿-v1-高清无网格底-2026-07-19.pptx",
);

const IMG = {
  runTrace: path.join(HIRES, "01_BooksAgent真实RunTrace_2x.png"),
  forge: path.join(HIRES, "02_AgentForge声明式安全审查_2x.png"),
  plaza: path.join(HIRES, "03_AgentPlaza播客摘要已安装_2x.png"),
  odessa: path.join(HIRES, "04_PublicEarth敖德萨文化新闻地图_2x.png"),
  climate: path.join(HIRES, "05_气候知识完整证据页_2x.png"),
  identity46: path.join(HIRES, "06_Frost身份卡46爵士夜行者_2x.png"),
  plazaNight: path.join(HIRES, "07_PublicPlaza夜间链上见闻_2x.png"),
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
  purple: "#8F70DC",
  orange: "#F28A4B",
  pink: "#EBCFD9",
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
    rect(slide, x, y + i * 49 + 8, 7, 7, i === 0 ? C.green : "#A8AFAB");
    textBox(slide, line, x + 18, y + i * 49, w - 18, 42, size, C.muted, false);
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

function smallLabel(slide, text, x, y, w, fill = C.green) {
  rect(slide, x, y, w, 24, fill, C.ink, 1);
  textBox(slide, text, x + 8, y + 4, w - 16, 16, 10, fill === C.black ? "#7CFFB0" : C.white, true, F.mono, "center");
}

async function slide11(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "AGENT HARNESS", 50, 46, 184, C.green);
  textBox(s, "总 Frost 负责判断，专业 Agent 负责完成", 50, 94, 865, 50, 35, C.ink, false);
  textBox(s, "隔离上下文 · 白名单工具 · 预算上限 · 可观测轨迹 · 确定性回退", 50, 151, 860, 30, 17, C.green, true);

  const cards = [
    { y: 220, n: "01", title: "FROST ROUTER", body: "识别对象、任务与所需领域", fill: C.paleBlue, accent: C.blue },
    { y: 306, n: "02", title: "SPECIALIST AGENT", body: "只读取必要上下文与白名单工具", fill: "#EEE8FA", accent: C.purple },
    { y: 392, n: "03", title: "BOUNDARY + RUNTRACE", body: "检查权限、字段、地点、预算与降级", fill: C.mint, accent: C.green },
    { y: 478, n: "04", title: "STRUCTURED RESULT", body: "形成草稿，等待用户确认后写回", fill: C.cream, accent: C.orange },
  ];
  cards.forEach((c, i) => {
    rect(s, 50, c.y, 735, 67, c.fill, C.ink, 1.1, null, "shadow-sm");
    rect(s, 50, c.y, 62, 67, c.accent);
    textBox(s, c.n, 50, c.y + 22, 62, 24, 15, C.white, true, F.mono, "center");
    textBox(s, c.title, 132, c.y + 10, 282, 23, 17, C.ink, true, F.mono);
    textBox(s, c.body, 132, c.y + 37, 525, 22, 14, C.muted, false);
    smallLabel(s, ["TASK", "ISOLATED", "AUDIT", "DRAFT"][i], 661, c.y + 20, 96, i === 2 ? C.green : C.black);
    if (i < cards.length - 1) textBox(s, "↓", 392, c.y + 65, 40, 22, 17, C.green, true, F.mono, "center");
  });
  rect(s, 50, 581, 735, 52, C.black);
  textBox(s, "模型负责理解，确定性代码守住边界。", 70, 596, 695, 24, 18, C.white, true, F.sans, "center");
  footer(s, 11, "FROST HARNESS");

  await addPhone(s, IMG.runTrace, 934, 96, 246, 534, "Books Agent real RunTrace");
  caption(s, "真实 RunTrace · 模型、技能、耗时与回退可见", 889, 643, 352, C.green);
  notes(s, "Frost 的核心是一套 Harness。总 Frost 判断任务，再把对象交给专业 Agent；每个 Agent 只拿到必要工具，并在隔离上下文里运行。Boundary 校验权限、字段、地点和预算，RunTrace 记录实际调用与降级路径。这样，Agent 的能力可以扩展，边界仍然清楚。");
}

async function slide12(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "CREATE · REVIEW · INSTALL", 50, 76, 264, C.green);
  textBox(s, "每个人都可以创造适合\nPocket Earth 的 Agent", 50, 146, 410, 98, 38, C.ink, false);
  textBox(s, "一句需求，被编译成可审核、可安装的能力", 50, 269, 420, 52, 19, C.green, true);
  bodyList(s, [
    "CREATE：自然语言描述空间或知识能力",
    "REVIEW：校验工具、URL、字段与权限",
    "INSTALL：用户确认后进入自己的 Pocket Earth",
  ], 50, 352, 400, 15);
  callout(s, "Agent 像平台上的应用。", "Injective 把公开身份与版本固定成可核对事实。", 50, 520, 394);
  footer(s, 12, "AGENT FORGE · PLAZA");

  await addPhone(s, IMG.forge, 500, 72, 252, 548, "Agent Forge manifest review");
  await addPhone(s, IMG.plaza, 924, 72, 252, 548, "Agent Plaza installed state");
  caption(s, "FORGE · manifest 通过安全审查", 503, 638, 320, C.blue);
  caption(s, "PLAZA · 明确安装，再由白名单 skill 运行", 927, 638, 315, C.green);
  notes(s, "用户可以用一句话描述想要的空间或知识能力。Agent Forge 把需求编译成声明式 manifest，reviewManifest 检查工具、URL 和权限，合格后发布到 Agent Plaza。用户明确安装，再由白名单 skill 运行。这个广场聚焦知识管理、公共核验、内容创作和空间体验。");
}

async function slide13(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "PUBLIC EARTH", 50, 76, 180, C.green);
  textBox(s, "公共地球在手机，\n公共事实在 Injective", 50, 146, 420, 98, 38, C.ink, false);
  textBox(s, "地图负责浏览，资源包负责内容，Injective 负责身份与版本证明", 50, 269, 420, 60, 18, C.green, true);
  bodyList(s, [
    "知识地图：便签回到真实发生地点",
    "知识详情：证据、来源与核验路径",
    "身份卡：公开 Agent 的可验证名片",
  ], 50, 350, 400, 15);
  callout(s, "高频地图交互留在 App。", "链上保存跨平台核对所需的最小公开事实。", 50, 520, 394);
  footer(s, 13, "PUBLIC EARTH");

  await addPhone(s, IMG.odessa, 500, 72, 252, 548, "Public Earth Odessa culture signal");
  await addPhone(s, IMG.climate, 924, 72, 252, 548, "Climate knowledge evidence detail");
  caption(s, "知识地图 · 新闻便签回到发生地点", 503, 638, 320, C.blue);
  caption(s, "知识详情 · 从摘要展开来源与证据", 927, 638, 315, C.green);
  notes(s, "Public Earth 是公开 Agent 与知识的空间入口。地图、缩放、便签和详情都在手机端运行，浏览过程保持轻快。Injective 记录需要长期核对的最小事实。三个子视图分开承载知识地图、知识详情和身份卡，让产品结构清楚，也把链上成本控制在稳定范围。");
}

async function slide14(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "IDENTITY DECK", 50, 76, 186, C.green);
  textBox(s, "同一轮廓，\n五个公开分身", 50, 146, 410, 98, 39, C.ink, false);
  textBox(s, "#43 Core · #44 Literature · #45 Noir\n#46 Jazz · #47 Aurora", 50, 267, 410, 54, 18, C.green, true, F.mono);
  bodyList(s, [
    "每张卡包含 agentId、象征门牌与 revision",
    "公开标签由用户确认，私人原始记忆继续隔离",
    "App、Public Earth 与 Blockscout 可以交叉核对",
  ], 50, 350, 400, 15);
  callout(s, "统一轮廓提供识别度。", "个体细节来自用户主动公开的长期口味。", 50, 520, 394);
  footer(s, 14, "FROST IDENTITY");

  await addPhone(s, IMG.identity46, 500, 72, 252, 548, "Frost identity card 46 Jazz");
  await addPhone(s, IMG.plazaNight, 924, 72, 252, 548, "Frost public plaza night report");
  caption(s, "#46 · 公开、持久、可验证的身份卡", 503, 638, 320, C.blue);
  caption(s, "PLAZA · 白天相遇，夜里带回公开见闻", 927, 638, 315, C.green);
  notes(s, "Frost 在公共地球上有一组公开身份。#43 是核心角色，#44 到 #47 分别承载文学、电影、爵士和极光等公开兴趣。每张卡都对应 agentId、象征门牌、cardHash 和 revision。统一轮廓让 Frost 跨 App、地图和硬件保持可识别，个体细节来自用户主动公开的标签。");
}

async function slide15(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "KNOWLEDGE SCOUT HARNESS", 50, 46, 282, C.green);
  textBox(s, "一个 Harness，八个领域 Agent", 50, 94, 800, 50, 36, C.ink, false);
  textBox(s, "共享工程护栏，保留领域差异", 50, 151, 760, 30, 18, C.green, true);

  const fields = [
    ["AI", "模型 · 产品", "#B9F59B"],
    ["科技", "芯片 · 机器人", "#D9CFFA"],
    ["金融", "市场 · 监管", "#F6DEA2"],
    ["气候", "能源 · 环境", "#B9E5DF"],
    ["科学", "研究 · 发现", "#EFC7D8"],
    ["健康生命", "医学 · 生命", "#F3C6BC"],
    ["文化", "遗产 · 城市", "#DED2F6"],
    ["政策社会", "制度 · 公共", "#C9DCF4"],
  ];
  fields.forEach(([title, sub, fill], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 50 + col * 304;
    const y = 214 + row * 76;
    rect(s, x, y, 278, 56, fill, C.ink, 1.15, null, "shadow-sm");
    rect(s, x, y, 7, 56, col === 0 ? C.green : col === 1 ? C.purple : col === 2 ? C.yellow : C.teal);
    textBox(s, title, x + 20, y + 8, 120, 22, 17, C.ink, true);
    textBox(s, sub, x + 20, y + 33, 160, 17, 11, C.muted, false);
    textBox(s, `FIELD 0${i + 1}`, x + 184, y + 20, 76, 18, 10, C.soft, true, F.mono, "right");
  });

  rect(s, 50, 390, 1180, 108, C.black, C.black, 0, "rounded-md", "shadow-md");
  textBox(s, "SHARED HARNESS", 76, 410, 235, 26, 20, "#7CFFB0", true, F.mono);
  textBox(s, "来源发现 · 去重 · 预算 · 证据包 · 评分 · 审计 · 每日版次", 76, 451, 592, 24, 17, C.white, true);
  rect(s, 718, 407, 1, 72, "#4C5A54");
  textBox(s, "领域配置只声明", 752, 410, 188, 20, 13, "#B8C1BC", true, F.mono);
  textBox(s, "来源 · 关键词 · 时效", 752, 439, 208, 24, 17, C.white, true);
  rect(s, 982, 416, 216, 50, C.greenDark, "#7CFFB0", 1);
  textBox(s, "单领域失败隔离", 982, 431, 216, 22, 15, C.white, true, F.sans, "center");

  const pipeline = ["DISCOVERY", "FOCUS", "DIRECT SOURCE", "INVESTIGATE", "SKEPTIC", "TRUTH SCORE"];
  pipeline.forEach((label, i) => {
    const x = 50 + i * 197;
    rect(s, x, 548, 166, 42, i === 5 ? C.mint : C.white, C.ink, 1.15);
    textBox(s, label, x + 6, 560, 154, 18, 11, i === 5 ? C.greenDark : C.ink, true, F.mono, "center");
    if (i < pipeline.length - 1) textBox(s, "→", x + 168, 557, 28, 24, 16, C.green, true, F.mono, "center");
  });
  rect(s, 50, 616, 1180, 46, C.mint, "#BDD8CB", 1);
  textBox(s, "一个 Harness 管住方法，八个 Agent 保持专业。", 70, 629, 1140, 22, 18, C.greenDark, true, F.sans, "center");
  notes(s, "自动找新闻采用一个共享 Harness 和八个领域配置 Agent。各领域只声明来源、关键词和时效，发现、去重、预算、证据、评分与审计由同一内核负责。这样既保留专业差异，也避免复制八套代码；单个领域出现来源问题时，整轮日更仍能继续。");
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  await slide11(p);
  await slide12(p);
  await slide13(p);
  await slide14(p);
  await slide15(p);

  for (const [i, slide] of p.slides.items.entries()) {
    const png = await p.export({ slide, format: "png", scale: 2 });
    await fs.writeFile(path.join(OUT, `slide-${i + 11}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(OUT, `slide-${i + 11}.layout.json`), await layout.text());
  }

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(PPTX);
  console.log(PPTX);
}

await main();

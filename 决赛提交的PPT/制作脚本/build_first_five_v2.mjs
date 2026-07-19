import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const LIB = path.join(PROJECT, "决赛提交的PPT", "PocketEarth_Injective_决赛产品全景截图库_2026-07-19");
const HIRES = path.join(LIB, "10_PPT高清源图_2x");
const OUT = path.join(PROJECT, "决赛提交的PPT", "前5页样稿预览-v4-高清无网格底-2026-07-19");
const PPTX = path.join(PROJECT, "决赛提交的PPT", "Pocket Earth on Injective-决赛路演PPT-前5页样稿-v4-高清无网格底-2026-07-19.pptx");

const IMG = {
  publicMap: path.join(HIRES, "02_公共知识地图_2x.png"),
  publicAgents: path.join(HIRES, "03_公共Agent网络总览_2x.png"),
  privateMap: path.join(HIRES, "01_私人地图总览_2x.png"),
  article: path.join(HIRES, "04_AI新闻全文展开_2x.png"),
  mapNote: path.join(HIRES, "05_地图新闻便签展开_2x.png"),
  merkle: path.join(HIRES, "06_AI可验证版次与Merkle证明_2x.png"),
  identity: path.join(HIRES, "07_Frost_43_记忆园_2x.png"),
  hardware: path.join(LIB, "09_硬件终端", "10_树莓派真机地球答案.jpg"),
};

const C = {
  bg: "#F4F5F2",
  grid: "#E3E6E2",
  ink: "#171918",
  muted: "#666D69",
  soft: "#8B918D",
  green: "#21936D",
  greenDark: "#2A604F",
  mint: "#E2F1EA",
  cyan: "#18C6DD",
  blue: "#2D62DD",
  cream: "#F7F2E6",
  white: "#FFFFFF",
  black: "#0C0F0E",
  yellow: "#F4C84A",
  purple: "#8F70DC",
};

const F = { sans: "PingFang SC", mono: "Arial" };

async function bytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function contentType(file) {
  return /\.jpe?g$/i.test(file) ? "image/jpeg" : "image/png";
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

function textBox(slide, text, x, y, w, h, size, color = C.ink, bold = false, family = F.sans) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = { fontSize: size, color, bold, fontFamily: family };
  return shape;
}

function grid(slide) {
  slide.background.fill = C.bg;
}

function topRule(slide) {
  rect(slide, 0, 0, 1280, 5, C.ink);
}

function tag(slide, label, x = 50, y = 74, w = 250, fill = C.green) {
  rect(slide, x, y, w, 34, fill, fill, 0, "rounded-md");
  textBox(slide, label, x + 14, y + 6, w - 28, 22, 15, C.white, false, F.mono);
}

function footer(slide, n, label) {
  rect(slide, 50, 663, 375, 1, "#C8CDCA");
  textBox(slide, `${String(n).padStart(2, "0")} / ${label}`, 50, 673, 360, 22, 11, C.soft, false, F.mono);
}

function callout(slide, title, body, x = 50, y = 520, w = 394) {
  rect(slide, x, y, w, 91, C.mint, "#C6DBD1", 1);
  rect(slide, x, y, 5, 91, C.green);
  textBox(slide, title, x + 18, y + 14, w - 35, 24, 17, C.greenDark, true);
  textBox(slide, body, x + 18, y + 47, w - 35, 34, 13, C.muted, false);
}

function bodyList(slide, lines, x, y, w, size = 16) {
  lines.forEach((line, i) => {
    rect(slide, x, y + i * 47 + 8, 7, 7, i === 0 ? C.green : "#A8AFAB");
    textBox(slide, line, x + 18, y + i * 47, w - 18, 40, size, C.muted, false);
  });
}

async function addPhone(slide, imgPath, x, y, w = 244, h = 528, alt = "Pocket Earth mobile interface") {
  rect(slide, x + 7, y + 9, w, h, "#D9DDDA", "none", 0, "rounded-xl", "shadow-md");
  slide.images.add({
    blob: await bytes(imgPath),
    contentType: contentType(imgPath),
    alt,
    fit: "cover",
    position: { left: x, top: y, width: w, height: h },
    geometry: "roundRect",
    borderRadius: "rounded-xl",
  });
  rect(slide, x, y, w, h, "none", "#4F5753", 1.25, "rounded-xl");
}

async function addPhoto(slide, imgPath, x, y, w = 244, h = 528, alt = "Frost Edge Node") {
  rect(slide, x + 7, y + 9, w, h, "#D9DDDA", "none", 0, "rounded-lg", "shadow-md");
  slide.images.add({
    blob: await bytes(imgPath),
    contentType: contentType(imgPath),
    alt,
    fit: "cover",
    position: { left: x, top: y, width: w, height: h },
    geometry: "roundRect",
    borderRadius: "rounded-lg",
  });
  rect(slide, x, y, w, h, "none", "#4F5753", 1.25, "rounded-lg");
}

function caption(slide, text, x, y, w, color = C.green) {
  textBox(slide, "▲", x, y, 18, 24, 14, color, true, F.mono);
  textBox(slide, text, x + 20, y - 1, w - 20, 36, 14, C.muted, false);
}

function stage(slide, n, title, body, x, y, w, color) {
  rect(slide, x, y, w, 98, C.white, C.ink, 1.4);
  rect(slide, x, y, w, 9, color);
  textBox(slide, String(n).padStart(2, "0"), x + 14, y + 19, 42, 23, 15, color, true, F.mono);
  textBox(slide, title, x + 56, y + 18, w - 66, 25, 17, C.ink, true);
  textBox(slide, body, x + 16, y + 55, w - 28, 30, 13, C.muted, false);
}

async function slide1(p) {
  const s = p.slides.add(); grid(s); topRule(s);
  tag(s, "FINAL · POCKET EARTH", 50, 76, 235, C.green);
  textBox(s, "Pocket Earth", 50, 144, 400, 60, 49, C.ink, true, F.mono);
  textBox(s, "on Injective", 50, 199, 400, 58, 47, C.greenDark, true, F.mono);
  textBox(s, "空间知识库 · 公共知识层\n链上身份 · 实体 Frost", 50, 292, 410, 90, 26, C.ink, false);
  textBox(s, "私人经历在端侧形成长期记忆；公共知识经过 Agent 核验，形成可下载、可复验的每日版次。", 50, 405, 390, 78, 17, C.muted, false);
  callout(s, "身份与知识版次已经在 Injective 上留下证据", "同一产品覆盖手机、Agent 网络、链上证明与树莓派实体终端。", 50, 520, 394);
  footer(s, 1, "OPENING");
  await addPhone(s, IMG.publicMap, 500, 72, 252, 548, "Public Earth knowledge map");
  await addPhone(s, IMG.publicAgents, 924, 72, 252, 548, "Public Agent network");
  caption(s, "PUBLIC EARTH · 知识信号回到地点", 503, 638, 320, C.blue);
  caption(s, "AGENT NETWORK · 8 领域发现 + 6 步核验", 927, 638, 315, C.green);
}

async function slide2(p) {
  const s = p.slides.add(); grid(s); topRule(s);
  tag(s, "WHY NOW · 问题", 50, 76, 178, C.green);
  textBox(s, "AI 时代，同时丢失了\n两件东西", 50, 146, 415, 124, 39, C.ink, false);
  textBox(s, "个人上下文，以及公共信息的可信度", 50, 292, 410, 50, 20, C.green, true);
  bodyList(s, [
    "个人知识散落在相册、地点与对话里",
    "公共信息高速增长，出处与版本难以复核",
    "Agent 需要可追溯的输入、时间与发布边界",
  ], 50, 366, 390, 16);
  callout(s, "AI 时代不缺数据，缺的是可信知识。", "一边重建人的长期上下文，一边保存公共知识的来源、证据和版本。", 50, 520, 394);
  footer(s, 2, "WHY NOW");
  await addPhone(s, IMG.privateMap, 500, 72, 252, 548, "Private map");
  await addPhone(s, IMG.article, 924, 72, 252, 548, "Expanded knowledge article");
  caption(s, "PRIVATE MAP · 个人经历重新回到地点", 503, 638, 320, C.blue);
  caption(s, "KNOWLEDGE DETAIL · 从摘要展开证据与来源", 927, 638, 315, C.green);
}

async function slide3(p) {
  const s = p.slides.add(); grid(s); topRule(s);
  tag(s, "KNOWLEDGE REFINERY · 知识炼油厂", 50, 54, 318, C.green);
  textBox(s, "把信息炼成可验证知识", 50, 105, 650, 56, 41, C.ink, false);
  textBox(s, "全球信号进入八个领域，六个角色完成事实核验，最终形成每日版次。", 50, 166, 800, 32, 18, C.muted, false);

  rect(s, 50, 226, 344, 308, C.cream, C.ink, 1.4, null, "shadow-sm");
  textBox(s, "“数据是新石油。数据有价值，\n但未经提炼就不能使用。”", 76, 258, 294, 96, 25, C.ink, false);
  textBox(s, "— Clive Humby", 76, 376, 250, 25, 15, C.greenDark, true, F.mono);
  rect(s, 76, 424, 282, 1, "#C7C2B8");
  textBox(s, "Pocket Earth 保存筛选、核验后的知识版次，\n同时保留原始来源与复验路径。", 76, 445, 280, 62, 16, C.muted, false);

  stage(s, 1, "公开信号", "8 个领域 Agent 每日收集", 438, 226, 176, C.blue);
  textBox(s, "→", 618, 257, 30, 36, 24, C.green, true, F.mono);
  stage(s, 2, "领域筛选", "去重、分类、压缩上下文", 648, 226, 176, C.cyan);
  textBox(s, "→", 828, 257, 30, 36, 24, C.green, true, F.mono);
  stage(s, 3, "交叉核验", "来源约束 + 人工发布闸门", 858, 226, 176, C.yellow);
  textBox(s, "→", 1038, 257, 30, 36, 24, C.green, true, F.mono);
  stage(s, 4, "每日版次", "Merkle 根锚定 Injective", 1068, 226, 164, C.greenDark);

  rect(s, 438, 366, 794, 168, C.white, C.ink, 1.4);
  textBox(s, "知识冷热分层", 462, 389, 180, 28, 20, C.ink, true);
  rect(s, 462, 434, 230, 70, "#E6F1FF", "#BDD1F2", 1);
  textBox(s, "热区 · 7 天", 480, 449, 120, 22, 16, C.blue, true);
  textBox(s, "完整新闻与运行上下文", 480, 476, 190, 20, 13, C.muted, false);
  textBox(s, "→", 711, 453, 30, 32, 23, C.green, true, F.mono);
  rect(s, 755, 434, 245, 70, C.mint, "#BCD9CD", 1);
  textBox(s, "长期层", 775, 449, 100, 22, 16, C.greenDark, true);
  textBox(s, "核验条目、证明与版次", 775, 476, 200, 20, 13, C.muted, false);
  textBox(s, "→", 1017, 453, 30, 32, 23, C.green, true, F.mono);
  rect(s, 1060, 434, 148, 70, "#F1EAFE", "#CFC1E9", 1);
  textBox(s, "端侧私域", 1078, 449, 108, 22, 16, C.purple, true);
  textBox(s, "私人记忆不上链", 1078, 476, 110, 20, 13, C.muted, false);

  rect(s, 50, 576, 1182, 60, C.black);
  textBox(s, "内容留在链下，Merkle 根锚定 Injective：保留丰富性，也让任何人都能独立验真。", 78, 595, 1080, 30, 19, C.white, true);
  footer(s, 3, "KNOWLEDGE REFINERY");
}

async function slide4(p) {
  const s = p.slides.add(); grid(s); topRule(s);
  tag(s, "PUBLIC EARTH · 公共知识层", 50, 76, 285, C.green);
  textBox(s, "把信息炼成一张\n知识地图", 50, 146, 420, 112, 39, C.ink, false);
  textBox(s, "卡片负责发现，详情负责理解，版次负责验真", 50, 287, 420, 52, 20, C.green, true);
  textBox(s, "新闻信号以便签落回真实地点；点开后得到摘要、意义、来源与核验状态。\n\n进入每日版次的条目可以下载资源包，在本地重新计算记录哈希、Merkle 路径与版次根。", 50, 366, 392, 140, 16, C.muted, false);
  callout(s, "渲染在端上，内容在包里，指纹在链上。", "公共地球节省链上存储成本，同时保留可下载、可迁移、可复验的知识。", 50, 520, 394);
  footer(s, 4, "PUBLIC KNOWLEDGE LAYER");
  await addPhone(s, IMG.mapNote, 500, 72, 252, 548, "Expanded news note on the map");
  await addPhone(s, IMG.merkle, 924, 72, 252, 548, "Merkle proof and daily edition");
  caption(s, "知识地图 · 便签落回新闻发生地", 503, 638, 320, C.blue);
  caption(s, "每日版次 · 下载包并复验 Merkle 证明", 927, 638, 315, C.green);
}

async function slide5(p) {
  const s = p.slides.add(); grid(s); topRule(s);
  tag(s, "FROST · AGENT IDENTITY", 50, 76, 238, C.green);
  textBox(s, "Frost：一台努力理解\n人类的机器", 50, 146, 420, 112, 38, C.ink, false);
  textBox(s, "同一角色贯穿 App、公共地球、身份卡与实体设备", 50, 286, 420, 58, 19, C.green, true);
  textBox(s, "Frost 的灵感来自《趁生命气息逗留》。统一的方形轮廓提供品牌识别度；每个人的记忆生成不同细节。\n\n#43–47 拥有公开可验证的 Agent 身份；实体 Frost 会把当天知识和链上见闻带回房间。", 50, 365, 395, 148, 16, C.muted, false);
  callout(s, "Frost 是产品本身。", "形象、声音、长期记忆、链上身份和实体身体属于同一个 Agent。", 50, 520, 394);
  footer(s, 5, "FROST IDENTITY");
  await addPhone(s, IMG.identity, 500, 72, 252, 548, "Frost identity card 43");
  await addPhoto(s, IMG.hardware, 924, 72, 252, 548, "Physical Frost Edge Node showing Earth Answer");
  caption(s, "身份卡 · 链上公开身份与个体差异", 503, 638, 320, C.blue);
  caption(s, "实体终端 · 同一个 Frost 在房间里开口", 927, 638, 315, C.green);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  await slide1(p);
  await slide2(p);
  await slide3(p);
  await slide4(p);
  await slide5(p);

  for (const [i, slide] of p.slides.items.entries()) {
    const png = await p.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(path.join(OUT, `slide-${i + 1}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(OUT, `slide-${i + 1}.layout.json`), await layout.text());
  }

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(PPTX);
}

await main();

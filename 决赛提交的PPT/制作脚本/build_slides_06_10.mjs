import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const LIB = path.join(
  PROJECT,
  "决赛提交的PPT",
  "PocketEarth_Injective_决赛产品全景截图库_2026-07-19",
);
const HIRES = path.join(LIB, "11_PPT高清源图_第6-10页_2x");
const OUT = path.join(
  PROJECT,
  "决赛提交的PPT",
  "第6-10页样稿预览-v1-高清无网格底-2026-07-19",
);
const PPTX = path.join(
  PROJECT,
  "决赛提交的PPT",
  "Pocket Earth on Injective-决赛路演PPT-第6-10页样稿-v1-高清无网格底-2026-07-19.pptx",
);

const IMG = {
  jot: path.join(HIRES, "01_JOT一个框记一切_2x.png"),
  photosAgent: path.join(HIRES, "02_PhotosAgent端侧整理_2x.png"),
  jotConfirm: path.join(HIRES, "03_JOT定位与用户确认_2x.png"),
  frost: path.join(HIRES, "05_Frost总Agent人格入口_2x.png"),
  photosMagazine: path.join(HIRES, "06_Photos杂志视图_2x.png"),
  photosYear: path.join(HIRES, "07_Photos杂志年度内页_2x.png"),
  photosCalendar: path.join(HIRES, "08_Photos日历视图_2x.png"),
  myAgents: path.join(HIRES, "09_MyAgents私人控制台_2x.png"),
  privateZoom: path.join(HIRES, "10_PrivateMap城市级缩放_2x.png"),
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

async function slide6(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "ONE USER JOURNEY", 50, 46, 224, C.green);
  textBox(s, "一张生活碎片，怎样长成属于你的地球", 50, 94, 900, 50, 35, C.ink, false);
  textBox(s, "端侧处理 → 用户确认 → 空间记忆 → Frost 回响", 50, 151, 920, 30, 18, C.green, true);

  const xs = [50, 304, 558, 812, 1066];
  const imgs = [IMG.jot, IMG.photosAgent, IMG.jotConfirm, IMG.photosCalendar, IMG.frost];
  const labels = [
    ["拍下 / 记下", "一句话或一张截图"],
    ["端侧处理", "原图优先不出手机"],
    ["建议地点", "用户确认后才钉回地球"],
    ["空间汇聚", "时间与地点重建上下文"],
    ["Frost 带回见闻", "同一角色继续理解用户"],
  ];
  const colors = [C.blue, C.cyan, C.green, C.purple, C.orange];

  for (let i = 0; i < xs.length; i++) {
    await addPhone(s, imgs[i], xs[i], 202, 164, 356, labels[i][0]);
    rect(s, xs[i] + 10, 188, 36, 28, colors[i], C.ink, 1);
    textBox(s, String(i + 1).padStart(2, "0"), xs[i] + 10, 194, 36, 18, 12, C.white, true, F.mono, "center");
    textBox(s, labels[i][0], xs[i], 574, 164, 23, 15, C.ink, true, F.sans, "center");
    textBox(s, labels[i][1], xs[i] - 5, 601, 174, 36, 11, C.muted, false, F.sans, "center");
    if (i < xs.length - 1) textBox(s, "→", xs[i] + 184, 348, 42, 36, 24, C.green, true, F.mono, "center");
  }
  rect(s, 50, 653, 1180, 48, C.black);
  textBox(s, "私人内容不进入公开路径；建议与确认之间，始终保留用户的决定。", 76, 668, 1128, 24, 17, C.white, true, F.sans, "center");
  notes(s, "这是一条完整的用户旅程。用户拍下一张票根，端侧先识别并处理敏感信息；Frost 给出地点建议，用户确认后才写入地图。同一座城里的书、电影、音乐、照片和行程逐步汇聚，形成长期空间记忆。公开 Agent 随后可以在 Public Earth 获取经过验证的知识，Frost Edge Node 再把这些公开见闻带回房间。");
}

async function slide7(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "THREE ENTRANCES · ONE EARTH", 50, 76, 315, C.green);
  textBox(s, "三个入口，共用同一颗地球", 50, 146, 420, 58, 39, C.ink, false);
  textBox(s, "Photos 看回忆，Earth 看全局，Agents 让一切运转", 50, 235, 420, 58, 19, C.green, true);
  bodyList(s, [
    "PHOTOS：时间、日历与杂志视图",
    "EARTH：私人知识地图与公共地球",
    "AGENTS：Frost、领域 Agent、Forge 与 Plaza",
  ], 50, 340, 400, 16);
  callout(s, "确认后的结果，最终都回到 Pocket Earth。", "界面有三个入口，产品只有一个空间主轴。", 50, 520, 394);
  footer(s, 7, "THREE ENTRANCES");
  await addPhone(s, IMG.photosMagazine, 500, 72, 252, 548, "Photos magazine view");
  await addPhone(s, IMG.myAgents, 924, 72, 252, 548, "My Agents private console");
  caption(s, "PHOTOS · 用杂志与时间回望私人照片", 503, 638, 320, C.blue);
  caption(s, "AGENTS · Frost 与专业 Agent 分工", 927, 638, 315, C.green);
  notes(s, "手机端保留三个主入口。Photos 用时间、日历和杂志回望照片；中间的 Earth 在私人知识地图与公共地球之间切换；Agents 承载 Frost Harness、领域 Agent、Forge 和 Plaza。三个入口共享同一套空间对象和长期记忆，任何经过确认的结果最终都会回到用户自己的地球。");
}

async function slide8(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "SYSTEM OVERVIEW", 50, 46, 208, C.green);
  textBox(s, "一颗地球，连接四个职责清楚的层", 50, 94, 880, 52, 36, C.ink, false);
  textBox(s, "私人空间 · 公共 Agent · 公共知识 · 实体交互", 50, 151, 930, 30, 18, C.green, true);

  const layers = [
    { n: "01", title: "私人空间层", place: "手机 / 本地", color: "#E8ECEA", objects: "书、影、乐、照片、行程、心情与长期画像", boundary: "原始私人内容不进入公开路径" },
    { n: "02", title: "公共 Agent 层", place: "服务端 / 公开身份", color: "#EFE8FA", objects: "身份、象征门牌、身份卡与公开关系事件", boundary: "Agent 推理与工具调用保持在链下" },
    { n: "03", title: "公共知识层", place: "资源包 / Injective 指纹", color: "#E4F4EC", objects: "真实新闻、核验记录、资源包与每日知识版次", boundary: "内容在包里，Merkle 根在 Injective" },
    { n: "04", title: "实体交互层", place: "Frost Edge Node", color: "#FCE7D9", objects: "屏幕、灯光、TTS、按键与手机镜像", boundary: "只消费公开事件与脱敏服务结果" },
  ];
  const ys = [212, 310, 408, 506];
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    rect(s, 50, ys[i], 1180, 78, l.color, C.ink, 1.25, null, "shadow-sm");
    rect(s, 50, ys[i], 76, 78, i === 0 ? C.black : i === 1 ? C.purple : i === 2 ? C.green : C.orange);
    textBox(s, l.n, 50, ys[i] + 24, 76, 24, 16, C.white, true, F.mono, "center");
    textBox(s, l.title, 150, ys[i] + 13, 250, 28, 20, C.ink, true);
    textBox(s, l.place, 150, ys[i] + 47, 260, 20, 13, C.greenDark, true, F.mono);
    rect(s, 430, ys[i] + 13, 1, 52, "#BBC1BD");
    textBox(s, l.objects, 456, ys[i] + 13, 390, 26, 15, C.ink, true);
    textBox(s, l.boundary, 456, ys[i] + 44, 410, 21, 12, C.muted, false);
    rect(s, 892, ys[i] + 14, 300, 50, C.white, "#C9CECB", 1);
    textBox(s, i === 0 ? "PRIVATE" : i === 1 ? "PUBLIC IDENTITY" : i === 2 ? "VERIFIABLE EDITION" : "PHYSICAL OUTPUT", 910, ys[i] + 18, 262, 18, 11, i === 0 ? C.ink : C.greenDark, true, F.mono, "center");
    textBox(s, ["不上公开链", "公开、持久、可审计", "editionRoot → Injective", "屏幕 · LED · TTS"][i], 910, ys[i] + 40, 262, 18, 12, C.muted, false, F.sans, "center");
  }
  for (let i = 0; i < 3; i++) textBox(s, "↓", 632, ys[i] + 76, 30, 24, 18, C.green, true, F.mono, "center");
  rect(s, 50, 620, 1180, 56, C.black);
  textBox(s, "渲染在端上，内容在包里，指纹在 Injective。", 70, 637, 1140, 26, 20, C.white, true, F.sans, "center");
  notes(s, "这张图是整个产品的边界。私人空间层在端侧组织人生；公共 Agent 层承载公开身份与关系；公共知识层把真实信号做成可下载版次；实体层让公开事件进入现实房间。我们的原则很简单：渲染在端上，内容在包里，指纹在 Injective。");
}

async function slide9(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "PRIVATE EARTH", 50, 76, 184, C.green);
  textBox(s, "让 Frost 逐步理解一个人", 50, 146, 420, 94, 39, C.ink, false);
  textBox(s, "把地理坐标变成个人知识的主键", 50, 267, 420, 52, 20, C.green, true);
  bodyList(s, [
    "一句话或一张截图，先建议地点",
    "用户确认后，才写入空间记忆",
    "书、影、乐、照片、行程和心情在空间中重逢",
  ], 50, 350, 400, 15);
  callout(s, "原始照片、心情原文与精确位置优先留在端侧。", "你可能忘了标题，却仍记得那本书在什么地方读完。", 50, 520, 394);
  footer(s, 9, "PRIVATE EARTH");
  await addPhone(s, IMG.privateZoom, 500, 72, 252, 548, "Private Earth city-level zoom");
  await addPhone(s, IMG.photosYear, 924, 72, 252, 548, "Photos yearly magazine inner pages");
  caption(s, "PRIVATE MAP · 城市、记忆与回望重新相遇", 503, 638, 320, C.blue);
  caption(s, "PHOTOS · 同一年的照片被重新组织", 927, 638, 315, C.green);
  notes(s, "Pocket Earth 最早解决的是个人记忆。很多时候，我们忘了标题和日期，却记得那本书在哪读完、那首歌在哪听见。Frost 把书影音、照片、行程和心情组织到地理坐标上。自动化只负责给建议，用户确认后才落点；敏感原文和精确位置继续留在端侧。");
}

async function slide10(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "DUAL-LAYER MEMORY · PRIVACY", 50, 46, 318, C.green);
  textBox(s, "当下保持连贯，长期只沉淀必要偏好", 50, 94, 960, 52, 36, C.ink, false);
  textBox(s, "工作记忆服务当前任务；长期画像保存结构化、脱敏的稳定信号", 50, 151, 980, 30, 18, C.green, true);

  rect(s, 50, 220, 405, 150, C.paleBlue, C.ink, 1.25, null, "shadow-sm");
  rect(s, 50, 220, 10, 150, C.blue);
  textBox(s, "01 · 工作记忆", 78, 240, 300, 28, 22, C.ink, true, F.mono);
  textBox(s, "最近交互 · 任务状态 · 待确认结果", 78, 287, 340, 26, 16, C.ink, true);
  textBox(s, "完成当前任务后自然衰减，不转换为永久原文。", 78, 324, 345, 32, 13, C.muted, false);

  rect(s, 50, 400, 405, 150, C.mint, C.ink, 1.25, null, "shadow-sm");
  rect(s, 50, 400, 10, 150, C.green);
  textBox(s, "02 · 长期画像", 78, 420, 300, 28, 22, C.ink, true, F.mono);
  textBox(s, "作者 · 导演 · 流派 · 城市 · 脱敏摘要", 78, 467, 340, 26, 16, C.ink, true);
  textBox(s, "只沉淀稳定偏好，支持跨会话的理解与推荐。", 78, 504, 345, 32, 13, C.muted, false);

  rect(s, 520, 286, 215, 198, C.black, C.black, 0, "rounded-lg", "shadow-md");
  textBox(s, "MEMORY\nROUTER", 545, 320, 165, 62, 24, C.white, true, F.mono, "center");
  rect(s, 558, 402, 138, 2, C.green);
  textBox(s, "按任务取用\n最少上下文", 548, 420, 160, 42, 14, "#7CFFB0", true, F.sans, "center");
  textBox(s, "→", 466, 298, 40, 40, 27, C.green, true, F.mono, "center");
  textBox(s, "→", 466, 476, 40, 40, 27, C.green, true, F.mono, "center");
  textBox(s, "→", 748, 365, 40, 40, 27, C.green, true, F.mono, "center");

  rect(s, 800, 220, 430, 330, C.white, C.ink, 1.25, null, "shadow-sm");
  textBox(s, "本轮 Agent 只看到必要标签", 828, 244, 370, 30, 22, C.ink, true);
  textBox(s, "TASK · 生成一份伦敦文化散步", 828, 292, 350, 22, 14, C.greenDark, true, F.mono);
  const chips = ["城市 · 伦敦", "偏好 · 现代主义", "时长 · 2 小时", "避开 · 人群拥挤"];
  chips.forEach((chip, i) => {
    rect(s, 828, 334 + i * 43, 340, 32, i % 2 ? C.cream : C.mint, "#BCC5C0", 1);
    textBox(s, chip, 844, 342 + i * 43, 310, 18, 14, C.ink, i === 0);
  });
  textBox(s, "不加载完整相册、票据、心情原文或精确坐标", 828, 510, 360, 26, 12, C.muted, false);

  rect(s, 50, 600, 1180, 80, C.cream, C.ink, 1.25);
  rect(s, 50, 600, 10, 80, C.orange);
  textBox(s, "PRIVACY BOUNDARY", 78, 618, 235, 22, 16, C.orange, true, F.mono);
  textBox(s, "原始照片、票据、证件、心情原文与精确坐标优先留在端侧；本地长期画像与 Injective 公开身份保持分离。", 320, 616, 870, 42, 15, C.ink, true);
  notes(s, "Frost 把短期上下文和长期画像分开管理。工作记忆服务当前任务，让连续对话保持连贯；长期层只沉淀作者、导演、流派和城市等结构化偏好。原始照片、票据、心情原文与精确坐标优先留在端侧。memoryRouter 会根据任务选择最少上下文，让 Frost 越用越懂用户，也让调用成本和隐私暴露保持可控。");
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  await slide6(p);
  await slide7(p);
  await slide8(p);
  await slide9(p);
  await slide10(p);

  for (const [i, slide] of p.slides.items.entries()) {
    const png = await p.export({ slide, format: "png", scale: 2 });
    await fs.writeFile(path.join(OUT, `slide-${i + 6}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(OUT, `slide-${i + 6}.layout.json`), await layout.text());
  }

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(PPTX);
  console.log(PPTX);
}

await main();

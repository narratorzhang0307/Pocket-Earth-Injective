import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const PPT = path.join(PROJECT, "决赛提交的PPT");
const ASSETS = path.join(PPT, "封面与开场页素材_2026-07-20");
const SOURCE = path.join(
  PPT,
  "Pocket Earth on Injective-决赛路演PPT-完整40页-硬件Azure强化终稿-v2-第40页修正-2026-07-20.pptx",
);
const OUT = path.join(
  PPT,
  "Pocket Earth on Injective-决赛路演PPT-完整43页-软硬共生开场版-2026-07-20.pptx",
);
const COVER_OUT = path.join(ASSETS, "PocketEarth_Injective_软硬共生封面_4K.png");

const COVER_BASE = path.join(ASSETS, "PocketEarth_Google版_拼贴视频封面_4K-原始参考.png");
const HARDWARE_PHOTO = path.join(ASSETS, "frost-edge-real-prototype-photo-clean.png");
const PRIVATE_MAP = path.join(
  PPT,
  "PocketEarth_Injective_决赛产品全景截图库_2026-07-19",
  "10_PPT高清源图_2x",
  "01_私人地图总览_2x.png",
);

const C = {
  bg: "#F4F5F2",
  ink: "#171918",
  muted: "#666D69",
  soft: "#858B87",
  green: "#21936D",
  greenDark: "#2A604F",
  mint: "#E2F1EA",
  cream: "#F3EEE2",
  white: "#FFFFFF",
  black: "#0C0F0E",
  orange: "#F05A2B",
  paleOrange: "#FCE6D8",
  blue: "#2D62DD",
  paleBlue: "#E6F0FF",
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

async function writeBlob(file, blob) {
  await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
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

async function addImage(slide, file, x, y, w, h, alt, fit = "cover", radius = null) {
  slide.images.add({
    blob: await bytes(file),
    contentType: contentType(file),
    alt,
    fit,
    position: { left: x, top: y, width: w, height: h },
    geometry: radius ? "roundRect" : "rect",
    ...(radius ? { borderRadius: radius } : {}),
  });
}

function note(slide, text) {
  slide.speakerNotes.textFrame.setText(text);
  slide.speakerNotes.setVisible(true);
}

function topRule(slide) {
  slide.background.fill = C.bg;
  rect(slide, 0, 0, 1280, 6, C.ink);
}

function tag(slide, label, x, y, w, fill = C.green) {
  rect(slide, x, y, w, 34, fill, fill, 0, "rounded-md");
  textBox(slide, label, x + 14, y + 6, w - 28, 22, 14, C.white, false, F.mono);
}

function footer(slide, n) {
  rect(slide, 48, 678, 355, 1, "#C8CDCA");
  textBox(
    slide,
    `${String(n).padStart(2, "0")} / POCKET EARTH ON INJECTIVE`,
    48,
    688,
    355,
    17,
    9,
    C.soft,
    false,
    F.mono,
  );
}

function numberCard(slide, n, title, body, x, y, accent, fill) {
  rect(slide, x, y, 392, 80, fill, "#CDD3CF", 1);
  rect(slide, x, y, 5, 80, accent);
  textBox(slide, String(n).padStart(2, "0"), x + 20, y + 22, 45, 28, 17, accent, true, F.mono);
  textBox(slide, title, x + 72, y + 13, 296, 25, 20, C.ink, true);
  textBox(slide, body, x + 72, y + 43, 296, 25, 13, C.muted, false);
}

async function makeRenderedCover() {
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  const slide = p.slides.add();
  await addImage(slide, COVER_BASE, 0, 0, 1280, 720, "Pocket Earth collage background", "cover");

  // Cover the former competition-specific lockup with a clean paper field.
  rect(slide, 27, 408, 642, 288, C.cream, C.cream, 0);
  rect(slide, 47, 427, 310, 36, C.black, C.black, 0);
  textBox(slide, "POCKET EARTH ON INJECTIVE", 62, 434, 280, 22, 14, C.white, true, F.mono);
  textBox(slide, "POCKET EARTH", 47, 480, 610, 66, 48, C.ink, true, F.sans);
  textBox(slide, "软硬共生，把世界带回现实。", 47, 554, 610, 46, 28, C.green, true, F.sans);
  rect(slide, 47, 615, 475, 2, C.ink);
  textBox(slide, "SOFTWARE EARTH  ×  FROST EDGE", 47, 634, 510, 25, 15, C.ink, false, F.mono);
  textBox(slide, "私人记忆 · 公共知识 · 链上身份 · 实体 Agent", 47, 663, 560, 22, 13, C.muted, false, F.sans);

  // Real device photo: one physical object inside the existing world collage.
  rect(slide, 965, 50, 267, 250, C.white, "#D5D0C5", 1, "rounded-lg", "shadow-lg");
  await addImage(slide, HARDWARE_PHOTO, 977, 62, 243, 194, "Frost Edge real working prototype", "cover", "rounded-md");
  rect(slide, 991, 248, 208, 32, C.black, C.black, 0);
  textBox(slide, "FROST EDGE · REAL DEVICE", 1002, 255, 188, 18, 11, C.white, true, F.mono, "center");
  rect(slide, 1088, 40, 48, 18, C.orange, C.orange, 0);

  const png = await p.export({ slide, format: "png", scale: 3 });
  await writeBlob(COVER_OUT, png);
  return new Uint8Array(await png.arrayBuffer());
}

function addProfileSlide(deck) {
  const slide = deck.slides.add();
  topRule(slide);
  tag(slide, "FOUNDER · PERSONAL PROFILE", 50, 55, 305);
  textBox(slide, "个人介绍", 50, 123, 520, 62, 43, C.ink, false);
  textBox(slide, "软件、文学与建筑的跨界实践", 50, 196, 720, 32, 24, C.green, true);
  rect(slide, 50, 245, 1180, 1, "#C7CCC9");

  textBox(
    slide,
    "南京大学研究生，独立开发者、小说作者、建筑师，曾获香港青年文学奖小说高级组冠军、贺财霖科幻文学奖银奖、读客科幻文学奖铜奖及特别奖、浙江省青年文学之星等奖项，作品发表于《收获》《花城》等顶尖文学期刊；获得“泉客松”AI 黑客松大赛一等奖，入围腾讯音乐黑客松决赛，以及阿里xARM手机应用大赛决赛（目前参赛中）。",
    50,
    282,
    1180,
    228,
    21,
    C.ink,
    false,
    F.sans,
  );

  const roles = [
    ["文学", "小说创作与叙事结构", C.orange, C.paleOrange],
    ["建筑", "空间、尺度与存在感", C.blue, C.paleBlue],
    ["软件", "独立开发与 Agent 系统", C.green, C.mint],
  ];
  roles.forEach(([title, body, accent, fill], index) => {
    const x = 50 + index * 402;
    rect(slide, x, 536, 378, 82, fill, "#CDD3CF", 1);
    rect(slide, x, 536, 6, 82, accent);
    textBox(slide, title, x + 24, 552, 72, 28, 18, accent, true);
    textBox(slide, body, x + 108, 553, 244, 26, 15, C.muted, false);
  });
  footer(slide, 2);
  note(
    slide,
    "我来自南京大学，也长期在文学、建筑与软件之间工作。小说训练让我重视叙事与人的经验，建筑训练让我重视空间与尺度，独立开发让我能把这些想法真正做成系统。Pocket Earth 就是在这三条路径交汇处长出来的。",
  );
}

async function addOverviewSlide(deck) {
  const slide = deck.slides.add();
  topRule(slide);
  tag(slide, "SOFTWARE × HARDWARE · 软硬共生", 50, 48, 340);
  textBox(slide, "一个系统，两种形态", 50, 111, 510, 48, 38, C.ink, false);
  textBox(slide, "Pocket Earth 软件地球 × Frost Edge 实体 Agent", 50, 170, 500, 28, 18, C.green, true);

  numberCard(slide, 1, "私人地球", "照片、书影音与行程重新回到地点", 50, 244, C.blue, C.paleBlue);
  numberCard(slide, 2, "公共 Agent 世界", "多领域筛选、核验并形成每日知识版次", 50, 340, C.green, C.mint);
  numberCard(slide, 3, "实体 Frost", "把链上见闻、口袋播客与地球答案带回现实", 50, 436, C.orange, C.paleOrange);

  // Software view.
  rect(slide, 575, 90, 223, 512, C.white, "#555C58", 1, "rounded-xl", "shadow-md");
  await addImage(slide, PRIVATE_MAP, 585, 100, 203, 492, "Pocket Earth private map mobile software", "cover", "rounded-lg");
  textBox(slide, "SOFTWARE EARTH", 598, 598, 180, 20, 12, C.blue, true, F.mono, "center");

  // Hardware view.
  rect(slide, 830, 122, 400, 360, C.white, "#555C58", 1, "rounded-xl", "shadow-md");
  await addImage(slide, HARDWARE_PHOTO, 842, 134, 376, 299, "Frost Edge real prototype", "cover", "rounded-lg");
  rect(slide, 842, 438, 376, 32, C.black, C.black, 0);
  textBox(slide, "FROST EDGE · REAL DEVICE", 856, 445, 348, 18, 12, C.white, true, F.mono, "center");
  textBox(slide, "屏幕 · 按钮 · LED · TTS", 880, 500, 300, 25, 17, C.orange, true, F.mono, "center");
  textBox(slide, "同一角色，在 App、公共地球与实体设备里保持可识别。", 845, 537, 370, 46, 15, C.muted, false, F.sans, "center");

  rect(slide, 50, 626, 1180, 38, C.black, C.black, 0);
  textBox(slide, "空间留在 Pocket Earth，身份与公共知识版次由 Injective 见证。", 72, 634, 1136, 22, 17, C.white, true, F.sans, "center");
  footer(slide, 3);
  note(
    slide,
    "Pocket Earth 从一开始就有两种存在方式。软件端负责私人记忆、公共知识与 Agent 协作；Frost Edge 把同一个角色带到现实房间，用屏幕、灯光与声音反馈链上身份和每日知识。两边共享的是同一套身份、版次与事件语义。",
  );
}

function coverOldFooterAndRenumber(slide, number) {
  rect(slide, 35, 657, 390, 63, C.bg, C.bg, 0);
  footer(slide, number);
}

async function appendExistingSlide(deck, sourceSlide, number) {
  const rendered = await sourceSlide.export({ format: "png", scale: 2 });
  const imageBytes = new Uint8Array(await rendered.arrayBuffer());
  const slide = deck.slides.add();
  slide.background.fill = C.bg;
  slide.images.add({
    blob: imageBytes.buffer.slice(imageBytes.byteOffset, imageBytes.byteOffset + imageBytes.byteLength),
    contentType: "image/png",
    alt: `Pocket Earth on Injective original slide ${number - 3}`,
    fit: "fill",
    position: { left: 0, top: 0, width: 1280, height: 720 },
    geometry: "rect",
  });
  coverOldFooterAndRenumber(slide, number);
  note(slide, sourceSlide.speakerNotes.text || "");
}

async function main() {
  await fs.mkdir(ASSETS, { recursive: true });
  const coverPng = await makeRenderedCover();

  const sourceBytes = await fs.readFile(SOURCE);
  const sourceDeck = await PresentationFile.importPptx(new Uint8Array(sourceBytes));
  if (sourceDeck.slides.items.length !== 40) {
    throw new Error(`Expected 40 source slides, got ${sourceDeck.slides.items.length}`);
  }

  const finalDeck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  // Slide 1 is a single rendered cover image, as requested.
  const cover = finalDeck.slides.add();
  cover.images.add({
    blob: coverPng.buffer.slice(coverPng.byteOffset, coverPng.byteOffset + coverPng.byteLength),
    contentType: "image/png",
    alt: "Pocket Earth on Injective software-hardware symbiosis cover",
    fit: "fill",
    position: { left: 0, top: 0, width: 1280, height: 720 },
    geometry: "rect",
  });
  note(
    cover,
    "各位评委好，我带来的是 Pocket Earth on Injective。它同时是一颗运行在手机里的知识地球，也是一台会在房间里发光、显示和播报的 Frost Edge。今天我想展示，软件如何记住世界，硬件又如何让 Agent 真正回到现实。",
  );

  addProfileSlide(finalDeck);
  await addOverviewSlide(finalDeck);

  let number = 3;
  for (const sourceSlide of sourceDeck.slides.items) {
    number += 1;
    await appendExistingSlide(finalDeck, sourceSlide, number);
  }

  if (finalDeck.slides.items.length !== 43) {
    throw new Error(`Expected 43 final slides, got ${finalDeck.slides.items.length}`);
  }

  const pptx = await PresentationFile.exportPptx(finalDeck);
  await pptx.save(OUT);
  console.log(OUT);
  console.log(COVER_OUT);
}

await main();

import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const ROOT = path.join(PROJECT, "决赛提交的PPT", "PocketEarth_Injective_决赛产品全景截图库_2026-07-19");
const HIRES = path.join(ROOT, "16_PPT高清源图_第31-32页_2x");
const CHAIN = path.join(ROOT, "08_Injective证据");
const HARDWARE = path.join(ROOT, "09_硬件终端");
const OUT = path.join(PROJECT, "决赛提交的PPT", "第31-32页终稿预览-v1-高清无网格底-2026-07-20");
const PPTX = path.join(PROJECT, "决赛提交的PPT", "Pocket Earth on Injective-决赛路演PPT-第31-32页终稿-v1-高清无网格底-2026-07-20.pptx");

const IMG = {
  source: path.join(HIRES, "02_现场闭环新闻全文与来源_2x.png"),
  verify: path.join(HIRES, "03_现场闭环六步核验路径_2x.png"),
  proof: path.join(HIRES, "05_现场闭环Merkle验证记录_2x.png"),
  map: path.join(HIRES, "06_收束页公共地球知识地图_2x.png"),
  qr: path.join(HIRES, "07_决赛演示站点二维码.png"),
  tx: path.join(CHAIN, "03_每日知识版次交易成功.png"),
  event: path.join(CHAIN, "04_每日知识版次事件日志.png"),
  edge: path.join(HARDWARE, "05_地球答案揭晓状态.png"),
};

const C = {
  bg: "#F4F5F2", ink: "#171918", muted: "#666D69", soft: "#8B918D",
  green: "#21936D", greenDark: "#2A604F", mint: "#E2F1EA", white: "#FFFFFF",
  black: "#0C0F0E", cyan: "#18C6DD", blue: "#2D62DD", paleBlue: "#E6F0FF",
  purple: "#8F70DC", palePurple: "#EEE8FA", orange: "#F28A4B", paleOrange: "#FBE7D8",
  yellow: "#F4C84A", paleYellow: "#FFF2CC", coral: "#EF766D", paleCoral: "#F8E1DE",
  teal: "#39B9AD", cream: "#F7F2E6",
};
const F = { sans: "PingFang SC", mono: "Arial" };

async function bytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function contentType(file) {
  return file.toLowerCase().endsWith(".jpg") || file.toLowerCase().endsWith(".jpeg") ? "image/jpeg" : "image/png";
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

function tag(slide, label, x = 50, y = 43, w = 250, fill = C.green) {
  rect(slide, x, y, w, 34, fill, fill, 0, "rounded-md");
  textBox(slide, label, x + 14, y + 6, w - 28, 22, 15, C.white, false, F.mono);
}

function footer(slide, n, label) {
  rect(slide, 50, 663, 375, 1, "#C8CDCA");
  textBox(slide, `${String(n).padStart(2, "0")} / ${label}`, 50, 673, 360, 22, 11, C.soft, false, F.mono);
}

function notes(slide, voiceover) {
  slide.speakerNotes.textFrame.setText(voiceover);
  slide.speakerNotes.setVisible(true);
}

async function addImage(slide, imgPath, x, y, w, h, alt, fit = "cover", radius = "rounded-md", line = "#4F5753") {
  rect(slide, x + 6, y + 7, w, h, "#D9DDDA", "none", 0, radius, "shadow-sm");
  slide.images.add({
    blob: await bytes(imgPath), contentType: contentType(imgPath), alt, fit,
    position: { left: x, top: y, width: w, height: h }, geometry: "roundRect", borderRadius: radius,
  });
  rect(slide, x, y, w, h, "none", line, 1.1, radius);
}

function stageHeader(slide, x, y, w, time, action, accent) {
  rect(slide, x, y, w, 38, accent, accent, 0, "rounded-sm");
  textBox(slide, time, x + 9, y + 7, 55, 20, 10, C.white, true, F.mono);
  textBox(slide, action, x + 61, y + 7, w - 70, 20, 10, C.white, true, F.mono, "right");
}

async function stageCard(slide, { x, time, action, title, body, accent, image, fit = "cover", device = false }) {
  const y = 195, w = 183, h = 360;
  rect(slide, x, y, w, h, C.white, C.ink, 1.15, null, "shadow-sm");
  stageHeader(slide, x, y, w, time, action, accent);
  if (!device) {
    slide.images.add({
      blob: await bytes(image), contentType: contentType(image), alt: `${action}: ${title}`,
      fit, position: { left: x + 11, top: y + 51, width: w - 22, height: 176 }, geometry: "rect",
    });
    rect(slide, x + 11, y + 51, w - 22, 176, "none", C.ink, 0.8);
  } else {
    rect(slide, x + 11, y + 51, w - 22, 176, C.black, C.black, 0);
    rect(slide, x + 33, y + 66, 117, 146, "#F7F2E6", "#6E766F", 1, "rounded-sm");
    slide.images.add({
      blob: await bytes(image), contentType: contentType(image), alt: "Frost Edge Node screen showing daily edition",
      fit: "contain", position: { left: x + 43, top: y + 76, width: 97, height: 126 }, geometry: "rect",
    });
    rect(slide, x + 22, y + 73, 8, 8, "#7CFFB0", "#7CFFB0", 0, "rounded-full");
    rect(slide, x + 22, y + 90, 8, 8, C.cyan, C.cyan, 0, "rounded-full");
    textBox(slide, "LED", x + 17, y + 112, 20, 12, 7, "#B9C8BF", true, F.mono, "center");
    textBox(slide, "TTS", x + 150, y + 78, 23, 12, 7, C.yellow, true, F.mono, "center");
    textBox(slide, "PHONE\nMIRROR", x + 146, y + 110, 30, 30, 7, C.white, true, F.mono, "center");
  }
  textBox(slide, title, x + 13, y + 243, w - 26, 36, 15, C.ink, true);
  textBox(slide, body, x + 13, y + 288, w - 26, 56, 11, C.muted, false);
}

async function slide31(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "LIVE DEMO · 55 SECONDS", 50, 42, 280, C.green);
  textBox(s, "Discover → Verify → Approve → Commit → Read → Echo", 50, 90, 1180, 44, 32, C.ink, false, F.mono);
  textBox(s, "同一条知识，从原始来源走到 Merkle proof、Injective root 与物理反馈", 50, 143, 1180, 28, 16, C.green, true);

  const gap = 16, w = 183;
  const x = (i) => 50 + i * (w + gap);
  await stageCard(s, { x: x(0), time: "00–10s", action: "DISCOVER", title: "打开真实来源", body: "新闻卡展开全文，保留来源、日期与公开链接。", accent: C.blue, image: IMG.source, fit: "cover" });
  await stageCard(s, { x: x(1), time: "10–20s", action: "VERIFY", title: "六步交叉核验", body: "核验路径明确呈现，模型不能自动发布。", accent: C.purple, image: IMG.verify, fit: "cover" });
  await stageCard(s, { x: x(2), time: "20–30s", action: "APPROVE", title: "查看 Merkle proof", body: "客户端重算 recordHash 与根，人工确认版次。", accent: C.orange, image: IMG.proof, fit: "cover" });
  await stageCard(s, { x: x(3), time: "30–36s", action: "COMMIT", title: "版次根写入 Injective", body: "revision 2 的 editionRoot 获得交易时间证据。", accent: C.green, image: IMG.tx, fit: "cover" });
  await stageCard(s, { x: x(4), time: "36–42s", action: "READ", title: "Frost #43 读取事件", body: "公开事件日志进入白名单 chain dispatch。", accent: C.teal, image: IMG.event, fit: "cover" });
  await stageCard(s, { x: x(5), time: "42–55s", action: "ECHO", title: "回到现实房间", body: "LED 改色、小屏显示版次；TTS 与手机镜像同步。", accent: C.coral, image: IMG.edge, device: true });

  rect(s, 50, 586, 1180, 54, C.black, C.black, 0, "rounded-sm");
  textBox(s, "MAIN PATH", 69, 603, 105, 19, 12, "#7CFFB0", true, F.mono);
  textBox(s, "真实知识卡 → proof → Injective root → Frost Edge Node", 179, 603, 586, 20, 14, C.white, true, F.mono);
  textBox(s, "FALLBACK", 801, 603, 91, 19, 12, C.yellow, true, F.mono);
  textBox(s, "离线 pack + Blockscout + 真实联调录屏", 894, 603, 313, 20, 13, "#E7ECE9", false);
  textBox(s, "同一条事实，从来源、资源包、Injective 一直走到现实房间。", 50, 644, 1180, 20, 15, C.greenDark, true, F.sans, "center");
  footer(s, 31, "LIVE DEMO · END-TO-END");
  notes(s, "我先打开一条真实新闻卡，进入全文并查看原始来源；接着进入核验页，看到 recordHash 和 Merkle proof。客户端重算得到的根与 Injective 上 revision 2 的 editionRoot 一致。Frost #43 读取这条公开事件，请看桌面：LED 改色，小屏出现标题和版次，TTS 读出见闻，手机镜像同步显示。演示前已经预加载知识卡、proof 与 Frost #43；若现场网络异常，会立即切换离线 pack、静态 Blockscout 和真实联调录屏。 ");
}

function resultRow(slide, y, index, title, body, accent) {
  rect(slide, 50, y, 438, 71, C.white, "#C9CFCC", 1);
  rect(slide, 50, y, 6, 71, accent);
  textBox(slide, index, 70, y + 18, 42, 28, 18, accent, true, F.mono, "center");
  textBox(slide, title, 121, y + 10, 345, 22, 16, C.ink, true);
  textBox(slide, body, 121, y + 36, 345, 25, 12, C.muted, false);
}

async function slide32(p) {
  const s = p.slides.add();
  base(s);
  tag(s, "POCKET EARTH ON INJECTIVE", 50, 44, 335, C.green);
  textBox(s, "把人生放回空间，\n把公共知识交给时间证明", 50, 100, 448, 94, 31, C.ink, false);
  textBox(s, "一颗私人地球 · 一个公开 Agent 世界 · 一台房间里的 Frost", 50, 214, 440, 48, 16, C.green, true);
  resultRow(s, 282, "01", "空间", "私人记忆与公共知识回到地点", C.blue);
  resultRow(s, 366, "02", "信任", "身份、门牌、版次与公开事件由 Injective 核对", C.green);
  resultRow(s, 450, "03", "存在感", "Frost Edge Node 把证据变成可见、可听的反馈", C.orange);

  rect(s, 50, 552, 438, 80, C.mint, "#BBD6C9", 1);
  textBox(s, "口袋地球装记忆，公共地球住分身。", 69, 570, 400, 24, 18, C.greenDark, true);
  textBox(s, "pocketearth-injective.throughtheglass.art", 69, 603, 400, 17, 11, C.muted, false, F.mono);

  rect(s, 540, 66, 690, 566, C.white, "#C8CECB", 1, "rounded-md", "shadow-sm");
  await addImage(s, IMG.map, 560, 86, 650, 268, "Public Earth knowledge map with verified public signals", "cover", "rounded-sm", C.greenDark);
  rect(s, 574, 101, 190, 27, C.black, C.black, 0, "rounded-sm");
  textBox(s, "SPACE · PUBLIC EARTH", 583, 107, 172, 16, 10, "#7CFFB0", true, F.mono, "center");

  await addImage(s, IMG.tx, 560, 376, 296, 183, "Injective transaction proving a daily knowledge edition root", "cover", "rounded-sm", C.greenDark);
  rect(s, 574, 389, 166, 27, C.greenDark, C.greenDark, 0, "rounded-sm");
  textBox(s, "TIME · INJECTIVE", 584, 395, 146, 16, 10, C.white, true, F.mono, "center");

  rect(s, 878, 376, 211, 183, C.black, C.black, 0, "rounded-sm", "shadow-sm");
  rect(s, 934, 389, 99, 150, C.cream, "#8C948F", 1, "rounded-sm");
  s.images.add({
    blob: await bytes(IMG.edge), contentType: contentType(IMG.edge), alt: "Frost Edge Node display",
    fit: "contain", position: { left: 945, top: 399, width: 77, height: 130 }, geometry: "rect",
  });
  rect(s, 898, 400, 10, 10, "#7CFFB0", "#7CFFB0", 0, "rounded-full");
  textBox(s, "FROST\nEDGE NODE", 1099, 421, 92, 45, 11, C.white, true, F.mono, "center");
  textBox(s, "presence", 1098, 476, 92, 18, 9, C.yellow, true, F.mono, "center");

  rect(s, 1104, 376, 106, 183, C.white, C.ink, 1, "rounded-sm");
  s.images.add({
    blob: await bytes(IMG.qr), contentType: "image/png", alt: "QR code to Pocket Earth on Injective demo",
    fit: "contain", position: { left: 1119, top: 391, width: 76, height: 76 }, geometry: "rect",
  });
  textBox(s, "OPEN DEMO", 1116, 478, 82, 18, 9, C.greenDark, true, F.mono, "center");
  textBox(s, "PUBLIC\nEVIDENCE", 1116, 506, 82, 30, 9, C.muted, true, F.mono, "center");

  textBox(s, "空间留在 Pocket Earth，时间由 Injective 见证。", 560, 582, 650, 26, 18, C.ink, true, F.sans, "center");
  footer(s, 32, "POCKET EARTH ON INJECTIVE");
  notes(s, "Pocket Earth 把私人记忆和公共知识都放回空间；Injective 让身份、门牌、版次与公开事件拥有可核对的时间证据；Frost Edge Node 再把这些事实带回现实房间。空间留在 Pocket Earth，时间由 Injective 见证。谢谢各位评委。最后一句说完停顿两秒，进入问答。 ");
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  await slide31(p);
  await slide32(p);

  for (const [i, slide] of p.slides.items.entries()) {
    const n = i + 31;
    const png = await p.export({ slide, format: "png", scale: 2 });
    await fs.writeFile(path.join(OUT, `slide-${n}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(OUT, `slide-${n}.layout.json`), await layout.text());
  }

  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(PPTX);
  console.log(PPTX);
}

await main();

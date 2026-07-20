import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const PPT = path.join(PROJECT, "决赛提交的PPT");
const ORIGINAL = path.join(PPT, "Pocket Earth on Injective-决赛路演PPT-完整32页-高清无网格终稿-2026-07-20.pptx");
const HARDWARE = path.join(PPT, "Pocket Earth on Injective-硬件Azure适配页-8页-2026-07-20.pptx");
const OUT = path.join(PPT, "Pocket Earth on Injective-决赛路演PPT-完整40页-硬件Azure强化终稿-2026-07-20.pptx");

async function load(file) {
  const b = await fs.readFile(file);
  return PresentationFile.importPptx(new Uint8Array(b));
}

function footer(slide, n) {
  slide.shapes.add({
    geometry: "rect", position: { left: 42, top: 690, width: 250, height: 22 },
    fill: "#F4F5F2", line: { style: "solid", fill: "#F4F5F2", width: 0 },
  });
  const t = slide.shapes.add({
    geometry: "textbox", position: { left: 45, top: 694, width: 245, height: 14 },
    fill: "none", line: { style: "solid", fill: "none", width: 0 },
  });
  t.text = `${String(n).padStart(2, "0")} / POCKET EARTH ON INJECTIVE`;
  t.text.style = { fontSize: 8, color: "#858B87", fontFamily: "Arial" };
}

async function appendRendered(target, sourceDeck, sourceSlide, n, prefix) {
  const rendered = await sourceDeck.export({ slide: sourceSlide, format: "png", scale: 2 });
  const imageBytes = new Uint8Array(await rendered.arrayBuffer());
  const slide = target.slides.add();
  slide.background.fill = "#F4F5F2";
  slide.images.add({
    blob: imageBytes.buffer.slice(imageBytes.byteOffset, imageBytes.byteOffset + imageBytes.byteLength),
    contentType: "image/png", alt: `${prefix} slide ${n}`, fit: "fill",
    position: { left: 0, top: 0, width: 1280, height: 720 }, geometry: "rect",
  });
  footer(slide, n);
  slide.speakerNotes.textFrame.setText(sourceSlide.speakerNotes.text || "");
  slide.speakerNotes.setVisible(true);
}

async function main() {
  const original = await load(ORIGINAL);
  const hardware = await load(HARDWARE);
  if (original.slides.items.length !== 32) throw new Error(`Expected 32 original slides, got ${original.slides.items.length}`);
  if (hardware.slides.items.length !== 8) throw new Error(`Expected 8 hardware slides, got ${hardware.slides.items.length}`);

  const finalDeck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  let n = 0;

  for (let i = 0; i < 20; i += 1) {
    n += 1;
    await appendRendered(finalDeck, original, original.slides.items[i], n, "Pocket Earth original");
  }
  for (const slide of hardware.slides.items) {
    n += 1;
    await appendRendered(finalDeck, hardware, slide, n, "Frost Edge Azure hardware");
  }
  for (let i = 20; i < original.slides.items.length; i += 1) {
    n += 1;
    await appendRendered(finalDeck, original, original.slides.items[i], n, "Pocket Earth original");
  }

  if (n !== 40) throw new Error(`Expected 40 slides, got ${n}`);
  const pptx = await PresentationFile.exportPptx(finalDeck);
  await pptx.save(OUT);
  console.log(OUT);
}

await main();

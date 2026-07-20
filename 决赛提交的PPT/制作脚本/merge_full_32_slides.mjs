import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const PPT = path.join(PROJECT, "决赛提交的PPT");
const SOURCES = [
  "Pocket Earth on Injective-决赛路演PPT-前5页样稿-v4-高清无网格底-2026-07-19.pptx",
  "Pocket Earth on Injective-决赛路演PPT-第6-10页样稿-v1-高清无网格底-2026-07-19.pptx",
  "Pocket Earth on Injective-决赛路演PPT-第11-15页样稿-v1-高清无网格底-2026-07-19.pptx",
  "Pocket Earth on Injective-决赛路演PPT-第16-20页样稿-v1-高清无网格底-2026-07-19.pptx",
  "Pocket Earth on Injective-决赛路演PPT-第21-25页样稿-v1-高清无网格底-2026-07-19.pptx",
  "Pocket Earth on Injective-决赛路演PPT-第26-30页样稿-v1-高清无网格底-2026-07-20.pptx",
  "Pocket Earth on Injective-决赛路演PPT-第31-32页终稿-v2-第40页证据区修正-2026-07-20.pptx",
].map((name) => path.join(PPT, name));

const OUT = path.join(PPT, "Pocket Earth on Injective-决赛路演PPT-完整32页-高清无网格终稿-v2-第40页证据区修正-2026-07-20.pptx");

const FALLBACK_NOTES = {
  1: "各位评委好，我带来的是 Pocket Earth on Injective。它从一张私人记忆地图出发，成长为一套空间 Agent 平台：私人生活留在自己的地球，公共身份与知识版次由 Injective 见证，Frost 再把经过验证的世界带到房间里的实体终端。开场时直接指向手机界面与桌面真机。",
  2: "我们每天都在记录，可这些记录散在相册、书单、片单、日历和地图里。另一边，公共内容生产越来越快，重复、误读和版本漂移一起增加。Pocket Earth 把两类问题放在同一颗地球上：私人侧重建上下文，公共侧建立证据。",
  3: "英国数学家克莱夫·洪比把数据比作石油：原料有价值，经过提炼才真正可用。Pocket Earth 的公共知识层做的就是这次提炼。Agent 找到信号，核验流程守住来源与事实，人工批准后生成可下载版次，再把版次根交给 Injective 留下公开时间证据。",
  4: "很多时候，我们想不起标题，却记得它发生在哪里。Pocket Earth 因此把地理坐标当作主键：缩放到世界，是轻量信号；靠近城市，照片、书影音、行程和公共知识会展开成可读卡片。空间语言连接了私人记忆与公共知识。",
  5: "Frost 的灵感来自《趁生命气息逗留》中一台努力理解人类的机器。这个来源与产品功能恰好重合：它通过书影音、照片、行程和公开知识逐步理解一个人。统一轮廓保证识别度，记忆生成的细节带来归属感，同一角色也真正住进了硬件。",
};

async function readPresentation(file) {
  const b = await fs.readFile(file);
  return PresentationFile.importPptx(new Uint8Array(b));
}

async function main() {
  const finalDeck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  let slideNumber = 0;

  for (const sourcePath of SOURCES) {
    const sourceDeck = await readPresentation(sourcePath);
    for (const sourceSlide of sourceDeck.slides.items) {
      slideNumber += 1;
      const rendered = await sourceDeck.export({ slide: sourceSlide, format: "png", scale: 2 });
      const renderedBytes = new Uint8Array(await rendered.arrayBuffer());
      const slide = finalDeck.slides.add();
      slide.background.fill = "#F4F5F2";
      slide.images.add({
        blob: renderedBytes.buffer.slice(renderedBytes.byteOffset, renderedBytes.byteOffset + renderedBytes.byteLength),
        contentType: "image/png",
        alt: `Pocket Earth on Injective final pitch slide ${slideNumber}`,
        fit: "fill",
        position: { left: 0, top: 0, width: 1280, height: 720 },
        geometry: "rect",
      });
      const note = sourceSlide.speakerNotes.text || FALLBACK_NOTES[slideNumber] || "";
      slide.speakerNotes.textFrame.setText(note);
      slide.speakerNotes.setVisible(true);
    }
  }

  if (slideNumber !== 32) {
    throw new Error(`Expected 32 slides, got ${slideNumber}`);
  }

  const pptx = await PresentationFile.exportPptx(finalDeck);
  await pptx.save(OUT);
  console.log(OUT);
}

await main();

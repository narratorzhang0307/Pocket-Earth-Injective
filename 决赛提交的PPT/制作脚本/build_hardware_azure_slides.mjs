import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/@oai+artifact-tool@file+local-deps+-oai-artifact-tool-oai-artifact_tool-2.8.24.tgz/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const PROJECT = "/Users/zhangcheng/Desktop/Pocket-Earth-Injective";
const ROOT = path.join(PROJECT, "决赛提交的PPT", "硬件路演素材_Injective_Azure_2026-07-20");
const SOURCE = path.join(ROOT, "原始4K副本");
const ADAPTED = path.join(ROOT, "Azure适配版4K");
const PPTX = path.join(PROJECT, "决赛提交的PPT", "Pocket Earth on Injective-硬件Azure适配页-8页-2026-07-20.pptx");

const FILES = [
  "01-mobile-to-frost-edge-system-boundary-4k.png",
  "02-frost-edge-raspberry-pi-runtime-layers-4k.png",
  "03-working-prototype-to-frost-edge-product-4k.png",
  "04-frost-edge-hardware-anatomy-google-ai-4k.png",
  "05-frost-edge-hardware-overview-4k.png",
  "06-frost-edge-real-device-experiences-4k.png",
  "07-gemma-gemini-edge-cloud-routing-4k.png",
  "08-code-to-device-verification-chain-4k.png",
];

const NOTES = [
  "这张图先划清手机、主服务和 Frost Edge 的职责。用户在手机端发起与回看；端侧 Gemma 处理受限分类、候选选择和弱网降级；复杂公共知识任务经主服务进入 Microsoft Foundry Model Router。设备只接收白名单公开事件，私密原文、精确坐标与云端密钥都不会进入硬件。",
  "树莓派内部由一条本地总线串起输入、常驻命令内核、Frost Agent 和实体反馈。Gemma 4 E4B IT 继续作为端侧模型，负责隐私判断、分类和候选选择；Microsoft Foundry Model Router 只处理获得授权的复杂公共任务。网络不可用时，规则、目录、缓存和上一版公共知识仍可工作。",
  "左侧是真实运行的树莓派原型，右侧是同一能力边界下的产品化外形。我们已经把屏幕、按钮、扬声器、摄像头和本地服务联调起来。端侧 Gemma 留在设备内，复杂任务由 Microsoft Foundry 经主服务路由，Frost 再把结果以屏幕、灯效和声音带回现实空间。",
  "这台设备的价值来自完整输入与反馈闭环：摄像头读取公开信息，麦克风有物理开关，Whisplay 展示 Trace，橙色键完成确认与切换。Raspberry Pi 5 上常驻 Gemma 4 E4B IT，云端复杂能力由 Microsoft Foundry 提供，设备本身不保存云端密钥。",
  "Frost Edge 当前使用 Raspberry Pi 5、Whisplay 与 8GB 内存，端侧模型保持 Gemma 4 E4B IT。设备把低认知负担的输入、显示、按钮、灯效和声音合并到一个实体中；Microsoft Foundry Model Router 负责经授权升级的复杂公共知识任务。",
  "一个 PI HOME 承载三种可现场运行的实体体验：口袋播客把每日知识版次转成可听内容，日落电台使用真实城市日落时间与本地曲库，地球答案每天零点揭晓一条行动提示。三种体验共享同一套按钮规则、屏幕状态、声音反馈和安全边界。",
  "端云协同由五道关口约束：规则快路、端侧 Gemma、隐私护栏、Microsoft Foundry Model Router、校验与人工确认。路由、耗时、失败降级和硬件动作都进入 Trace；云端只接触经过允许的公共字段，端侧失败时回到规则、缓存和手动路径。",
  "最后是从代码到真机的证据链。安装脚本、模型文件校验、systemd 服务、真实请求、生产界面和技术材料一一对应。端侧 Gemma 的来源与哈希可以复核，Microsoft Foundry 的请求由主服务统一管理；真机状态、日志、屏幕和 Trace 共同形成可复现的运行证据。",
];

const C = { white: "#F7F7F4", ink: "#111311", green: "#0C8B61", black: "#0B0E0C", orange: "#F25525", cyan: "#16BFD3", lavender: "#A28BC5", pale: "#EEF4F0" };
const F = { sans: "PingFang SC", mono: "Arial" };

async function bytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function rect(slide, x, y, w, h, fill, line = fill, width = 0) {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: line, width },
  });
}

function textBox(slide, text, x, y, w, h, size = 16, color = C.ink, bold = false, family = F.sans, align = "left") {
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

function patch(slide, x, y, w, h, text, size = 15, color = C.ink, bold = false, fill = C.white, align = "left", pad = 8, family = F.sans) {
  rect(slide, x, y, w, h, fill, fill, 0);
  return textBox(slide, text, x + pad, y + Math.max(3, pad - 2), w - pad * 2, h - Math.max(6, pad), size, color, bold, family, align);
}

function blackTag(slide, x, y, w, text) {
  rect(slide, x, y, w, 25, C.black, C.black, 0);
  textBox(slide, text, x + 10, y + 5, w - 20, 16, 10, "#FFFFFF", true, F.mono, "center");
}

async function background(slide, file) {
  slide.images.add({
    blob: await bytes(file), contentType: "image/png", alt: path.basename(file), fit: "fill",
    position: { left: 0, top: 0, width: 1280, height: 720 }, geometry: "rect",
  });
}

function adapt01(s) {
  blackTag(s, 36, 27, 252, "POCKET EARTH · EDGE × AZURE");
  patch(s, 790, 31, 345, 65, "手机 / PWA 只与 Pocket Earth 主服务通信；树莓派承接三个实体入口。端侧 Gemma 处理受限任务，复杂公共知识经主服务升级 Microsoft Foundry Model Router，云端密钥不进入设备。", 11, C.ink, false, C.white, "left", 6);
  patch(s, 797, 78, 215, 22, "联网 · Microsoft Foundry", 10, C.ink, true, "#F4B18D", "center", 4, F.mono);
  patch(s, 293, 167, 211, 86, "Shell / Router / Boundary\n规则快路 → Gemma → 隐私护栏 → Foundry → Validator / Critic。", 12, C.ink, false, "#DDEEE9", "left", 10);
  patch(s, 293, 280, 211, 166, "CLOUD\nMicrosoft Foundry\nModel Router\n\n复杂多语与公共知识审查；路由、传输和调用模型分开记录。", 11, C.ink, false, C.white, "left", 10);
  patch(s, 1013, 133, 250, 30, "05 · Azure 端云能力", 13, C.ink, true, "#A997C6", "left", 10, F.mono);
  patch(s, 1030, 274, 220, 108, "AZURE ROUTER\nMicrosoft Foundry\n\n复杂公共理解与校验；模型路由、失败降级与 Trace 由主服务管理。", 12, C.ink, false, "#E7DFF2", "left", 10);
  patch(s, 297, 582, 700, 103, "", 10, C.ink, false, "#FBFAF4", "left", 0);
  rect(s, 647, 582, 1, 103, "#C9CDCA", "#C9CDCA", 0);
  textBox(s, "02 · 云能力只经主服务", 320, 602, 300, 18, 10, C.green, true, F.mono);
  textBox(s, "Foundry 调用、端点和模型路由由主服务统一管理。", 320, 628, 300, 35, 10, "#555B57", false, F.sans);
  textBox(s, "03 · 本地 Gemma 不扩权", 670, 602, 300, 18, 10, C.green, true, F.mono);
  textBox(s, "端侧负责受限任务；设备不保存云密钥。", 670, 628, 300, 35, 10, "#555B57", false, F.sans);
}

function adapt02(s) {
  blackTag(s, 36, 26, 232, "FROST EDGE · AZURE HYBRID");
  patch(s, 35, 88, 850, 26, "所有硬件入口进入 Device Harness；规则与 Gemma 先在本机处理，复杂公共任务才经主服务升级 Microsoft Foundry；状态返回 Whisplay、声音与手机。", 12, "#666A67", false, C.white, "left", 4);
  patch(s, 37, 428, 300, 53, "口袋播客\n八领域公共知识 → Foundry 双路径核验 → Truth Score → 人工发布。", 11, C.ink, false, "#DDEEE9", "left", 8);
  patch(s, 50, 526, 288, 29, "4 · AZURE 云端与实体反馈", 11, C.ink, true, "#F4BB50", "left", 10, F.mono);
  patch(s, 350, 563, 289, 52, "Foundry Adapter\n复杂公共任务经主服务升级；Pi 不保存云密钥。", 11, C.ink, false, C.white, "left", 8);
  patch(s, 440, 673, 394, 20, "网络降级：保留规则、本地目录与上一版公共知识。", 10, "#5F655F", false, C.white, "left", 5);
}

function adapt03(s) {
  patch(s, 37, 47, 700, 76, "从已运行真机原型，走向\nFrost Edge 实体智能终端", 28, C.ink, true, C.white, "left", 5);
  patch(s, 760, 44, 450, 76, "Pocket Earth 已完成树莓派、Whisplay、按钮、扬声器与摄像头联调。端侧 Gemma 先处理隐私判断、分类与候选选择；复杂公共任务经主服务升级 Microsoft Foundry Model Router。", 11, C.ink, false, C.white, "left", 8);
  patch(s, 610, 459, 626, 39, "橙白终端整合 Frost Agent 人格、三种实体入口与 Azure 云端路由，把 Pocket Earth 从 Web/PWA 延伸到现实空间。", 11, C.ink, false, "#FBFAF4", "left", 9);
  patch(s, 841, 540, 390, 24, "Gemma on device · Microsoft Foundry in Azure", 11, C.green, true, "#FBFAF4", "right", 4, F.mono);
  patch(s, 649, 600, 310, 54, "03  Microsoft Foundry 复杂理解\n复杂多语与公共知识任务经主服务升级；云端密钥不进入设备。", 10, C.ink, false, C.white, "left", 7);
}

function adapt04(s) {
  patch(s, 925, 78, 255, 67, "摄像头、屏幕、按钮、音频、端侧 Gemma 与 Frost Agent 在树莓派终端内协作；复杂公共任务经主服务升级 Microsoft Foundry，云端密钥不进入设备。", 10, C.ink, false, C.white, "left", 6);
  patch(s, 925, 288, 280, 70, "06  Gemma 4 E4B IT\n5.15 GB 端侧模型：隐私判断、分类、候选选择与降级。", 12, C.ink, false, C.white, "left", 10);
  patch(s, 35, 690, 250, 17, "POCKET EARTH · FROST EDGE", 8, C.ink, true, C.white, "left", 4, F.mono);
}

function adapt05(s) {
  patch(s, 37, 82, 750, 25, "Pocket Earth 的实体端：橙白终端保留屏幕、按钮、灯效与声音；端侧 Gemma 与 Azure 云端路由清晰分工。", 13, "#6A6F6B", false, C.white, "left", 4);
  patch(s, 650, 347, 588, 126, "MICROSOFT AZURE\n\n• 本地 Gemma 处理受限分类与隐私敏感选择\n• 复杂公共任务经用户同意升级 Microsoft Foundry Model Router\n• 树莓派不保存云端密钥和私人记忆原文", 13, C.ink, false, C.white, "left", 14);
  patch(s, 441, 665, 394, 26, "云端：Microsoft Foundry Model Router", 11, C.ink, false, C.white, "left", 8);
}

function adapt06(s) {
  patch(s, 408, 168, 166, 171, "MICROSOFT\nFOUNDRY\nMODEL ROUTER\n\n复杂知识升级\n端侧云密钥：0\nTRACE 可见", 14, "#FFFFFF", true, "#121613", "center", 16, F.mono);
  patch(s, 342, 522, 286, 31, "LOCAL / AZURE", 11, C.green, true, "#FBFAF4", "left", 8, F.mono);
  patch(s, 350, 551, 270, 57, "Rules → Gemma → Foundry\n隐私判断与候选选择留在本机；复杂公共任务经授权升级。", 11, C.ink, false, "#FBFAF4", "left", 6);
}

function adapt07(s) {
  blackTag(s, 36, 26, 247, "MICROSOFT FOUNDRY · ROUTING");
  patch(s, 35, 54, 1030, 55, "Gemma × Microsoft Foundry · Frost Edge 的端云双脑与可观察 Harness", 23, C.ink, true, C.white, "left", 4);
  patch(s, 769, 120, 230, 90, "04 · FOUNDRY\n复杂公共理解\nMicrosoft Foundry Model Router 负责复杂、多语与高质量公共知识任务。", 12, C.ink, false, C.white, "left", 10);
  patch(s, 915, 239, 319, 159, "FOUNDRY + TRACE\n\n复杂任务升级，链路可见\n\nMicrosoft Foundry 只处理授权后的公共字段；model、transport、耗时、错误与 fallback 分开记录。\n\nFoundry → Validator → Confirm Gate", 11, C.ink, false, C.white, "left", 12);
  rect(s, 34, 515, 1192, 139, "#FBFAF4", "#151815", 1);
  rect(s, 332, 520, 1, 128, "#CDD2CE", "#CDD2CE", 0);
  rect(s, 630, 520, 1, 128, "#CDD2CE", "#CDD2CE", 0);
  rect(s, 928, 520, 1, 128, "#CDD2CE", "#CDD2CE", 0);
  textBox(s, "MODEL / OWNER", 54, 530, 250, 18, 10, C.green, true, F.mono);
  textBox(s, "Gemma 4 E4B IT\nlocal = true\n5.15 GB · verified hash", 54, 554, 250, 78, 12, C.ink, false, F.mono);
  textBox(s, "ENDPOINT / ISOLATION", 352, 530, 250, 18, 10, C.green, true, F.mono);
  textBox(s, "loopback-only service\nno cloud keys on Pi\nprivate memory stays local", 352, 554, 250, 78, 12, C.ink, false, F.mono);
  textBox(s, "CLOUD / TRANSPORT", 650, 530, 250, 18, 10, C.green, true, F.mono);
  textBox(s, "Microsoft Foundry\nvia Pocket Earth server\nauthorized public fields only", 650, 554, 250, 78, 12, C.ink, false, F.mono);
  textBox(s, "FAILURE / SAFETY", 948, 530, 250, 18, 10, C.green, true, F.mono);
  textBox(s, "rules + cache fallback\nValidator / Critic gate\nmanual confirmation", 948, 554, 250, 78, 12, C.ink, false, F.mono);
  patch(s, 37, 232, 518, 171, "REAL TWIN · RUNTRACE\n\nLOCAL GEMMA  5.15 GB\nFOUNDRY MODEL ROUTER\nPUBLIC-ONLY EDGE\n\n3 PHYSICAL MODES · 12 REAL SCREENS\n0 CLOUD KEYS ON PI", 12, "#73F7B0", true, "#0E1210", "left", 14, F.mono);
}

function adapt08(s) {
  patch(s, 40, 237, 385, 45, "Frost Edge 实体终端 · Azure 协同 Agent", 14, C.ink, true, C.white, "left", 8);
  patch(s, 442, 236, 392, 45, "FOUNDRY + LOCAL RULES · 六阶段事实核验", 13, C.ink, true, "#FBFAF4", "left", 8, F.mono);
  patch(s, 853, 236, 390, 45, "Gemma on device · Foundry via server", 13, "#73F7B0", true, "#0E1210", "left", 8, F.mono);
  patch(s, 40, 282, 385, 120, "REAL DEVICE\n\nRaspberry Pi 5 + Whisplay\nbuttons · LED · speaker · camera\nsystemd services · local cache", 12, C.ink, true, "#F4F6F2", "left", 14, F.mono);
  patch(s, 442, 276, 392, 126, "FOUNDRY EVIDENCE\n\nClaim Intake → Evidence Scout\nInvestigator ↔ Skeptic\nJudge → RunTrace → Confirm Gate", 12, "#72F5B0", true, "#0E1210", "left", 14, F.mono);
  patch(s, 853, 282, 390, 120, "EDGE / CLOUD TRACE\n\nLOCAL  Gemma 4 E4B IT\nCLOUD  Microsoft Foundry\nOUTPUT verified public knowledge", 12, "#72F5B0", true, "#0E1210", "left", 14, F.mono);
  patch(s, 36, 526, 300, 127, "CODE / GITHUB\n\n代码到真机\nhardware/frost-edge/raspi/\ninstall · service · verify · logs", 11, C.ink, true, "#FBFAF4", "left", 12, F.mono);
  patch(s, 442, 400, 392, 52, "核验结论、模型路由与确认状态由真机路径导出，形成可回放的 RunTrace。", 10, "#666A67", false, "#FBFAF4", "left", 10);
}

const ADAPTERS = [adapt01, adapt02, adapt03, adapt04, adapt05, adapt06, adapt07, adapt08];

async function main() {
  await fs.mkdir(ADAPTED, { recursive: true });
  const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  for (let i = 0; i < FILES.length; i += 1) {
    const slide = p.slides.add();
    await background(slide, path.join(SOURCE, FILES[i]));
    ADAPTERS[i](slide);
    slide.speakerNotes.textFrame.setText(NOTES[i]);
    slide.speakerNotes.setVisible(true);

    const png = await p.export({ slide, format: "png", scale: 3.2 });
    const name = `${String(i + 1).padStart(2, "0")}-frost-edge-azure-adapted-4k.png`;
    await fs.writeFile(path.join(ADAPTED, name), new Uint8Array(await png.arrayBuffer()));
  }

  const imageDeck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  for (let i = 0; i < FILES.length; i += 1) {
    const imagePath = path.join(ADAPTED, `${String(i + 1).padStart(2, "0")}-frost-edge-azure-adapted-4k.png`);
    const slide = imageDeck.slides.add();
    slide.images.add({
      blob: await bytes(imagePath), contentType: "image/png", alt: `Frost Edge Azure adapted hardware slide ${i + 1}`,
      fit: "fill", position: { left: 0, top: 0, width: 1280, height: 720 }, geometry: "rect",
    });
    slide.speakerNotes.textFrame.setText(NOTES[i]);
    slide.speakerNotes.setVisible(true);
  }

  const pptx = await PresentationFile.exportPptx(imageDeck);
  await pptx.save(PPTX);
  console.log(PPTX);
}

await main();

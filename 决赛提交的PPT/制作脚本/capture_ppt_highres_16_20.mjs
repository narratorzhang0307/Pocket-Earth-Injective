import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const playwrightModule =
  process.env.POCKET_EARTH_PLAYWRIGHT_MODULE ||
  "/Users/zhangcheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const { chromium } = require(playwrightModule);

const baseUrl = process.env.POCKET_EARTH_CAPTURE_URL || "http://127.0.0.1:3010/?keep";
const outputDir =
  process.env.POCKET_EARTH_CAPTURE_DIR ||
  "/Users/zhangcheng/Desktop/Pocket-Earth-Injective/决赛提交的PPT/PocketEarth_Injective_决赛产品全景截图库_2026-07-19/13_PPT高清源图_第16-20页_2x";
const executablePath =
  process.env.POCKET_EARTH_CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const handshakeTx =
  "https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath });

async function createPage(url = baseUrl) {
  const page = await browser.newPage({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  return page;
}

async function capture(filename, url = baseUrl, prepare = async () => {}) {
  const page = await createPage(url);
  await prepare(page);
  await page.waitForTimeout(650);
  await page.screenshot({
    path: path.join(outputDir, filename),
    animations: "disabled",
  });
  await page.close();
}

async function openDailyKnowledge(page) {
  await page.getByRole("button", { name: "打开智能体" }).click();
  await page.waitForTimeout(350);
  await page
    .getByRole("button", {
      name: "打开今日公共知识版次：八个领域 Agent 发现信号，六个核验 Agent 交叉审查",
    })
    .click();
  await page.getByText("EDITION · 2026-07-19", { exact: true }).waitFor();
}

await capture("01_AI版次验证记录与Merkle证明_2x.png", baseUrl, async (page) => {
  await openDailyKnowledge(page);
  await page.getByRole("button", { name: "验证记录" }).click();
  const proof = page.getByText(/Merkle 证明通过/).first();
  await proof.waitFor();
  await proof.scrollIntoViewIfNeeded();
});

await capture(
  "02_Injective证据页真实握手_2x.png",
  "http://127.0.0.1:3010/injective.html",
  async (page) => {
    const heading = page.getByRole("heading", { name: "SocialHandshake · a real contract & event" });
    await heading.scrollIntoViewIfNeeded();
  },
);

await capture("03_Blockscout握手交易成功_2x.png", handshakeTx, async (page) => {
  await page.getByRole("heading", { name: "Transaction details" }).waitFor({ timeout: 25_000 });
});

await capture("04_Blockscout握手事件日志_2x.png", handshakeTx, async (page) => {
  await page.getByRole("tab", { name: "Logs" }).click();
  await page.getByText("Topics", { exact: true }).first().waitFor({ timeout: 25_000 });
});

await browser.close();
console.log(`Captured 4 new PPT screenshots at 860×1864 into ${outputDir}`);

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
  "/Users/zhangcheng/Desktop/Pocket-Earth-Injective/决赛提交的PPT/PocketEarth_Injective_决赛产品全景截图库_2026-07-19/10_PPT高清源图_2x";
const executablePath =
  process.env.POCKET_EARTH_CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath });

async function createPage() {
  const page = await browser.newPage({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  return page;
}

async function capture(filename, prepare = async () => {}) {
  const page = await createPage();
  await prepare(page);
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(outputDir, filename), animations: "disabled" });
  await page.close();
}

async function openPublicEarth(page) {
  await page.getByRole("button", { name: /PUBLIC EARTH/ }).click();
  await page.waitForTimeout(900);
}

async function openKnowledgeDetails(page) {
  await openPublicEarth(page);
  await page.getByRole("button", { name: "知识详情" }).click();
}

async function openPublicAgents(page) {
  await page.locator("button").filter({ hasText: /^Agents$/ }).last().click();
  await page.getByRole("button", { name: /PUBLIC AGENTS/ }).click();
}

await capture("01_私人地图总览_2x.png");

await capture("02_公共知识地图_2x.png", async (page) => {
  await openPublicEarth(page);
});

await capture("03_公共Agent网络总览_2x.png", async (page) => {
  await openPublicAgents(page);
});

await capture("04_AI新闻全文展开_2x.png", async (page) => {
  await openKnowledgeDetails(page);
  await page.getByRole("button", { name: "展开阅读全文" }).click();
});

await capture("05_地图新闻便签展开_2x.png", async (page) => {
  await openPublicEarth(page);
  await page
    .getByRole("button", { name: /美国.*芯片与 AI 监管行动/ })
    .evaluate((element) => element.click());
});

await capture("06_AI可验证版次与Merkle证明_2x.png", async (page) => {
  await openKnowledgeDetails(page);
  await page
    .locator("button")
    .filter({ hasText: "PUBLIC KNOWLEDGE LAYER" })
    .evaluate((element) => element.click());
});

await capture("07_Frost_43_记忆园_2x.png", async (page) => {
  await openPublicEarth(page);
  await page
    .getByRole("button", { name: "身份卡牌" })
    .evaluate((element) => element.click());
});

await browser.close();
console.log(`Captured 7 PPT screenshots at 860×1864 into ${outputDir}`);

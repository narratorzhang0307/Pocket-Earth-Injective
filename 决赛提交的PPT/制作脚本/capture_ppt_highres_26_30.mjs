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
  "/Users/zhangcheng/Desktop/Pocket-Earth-Injective/决赛提交的PPT/PocketEarth_Injective_决赛产品全景截图库_2026-07-19/15_PPT高清源图_第26-30页_2x";
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
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 45_000 });
  await page.waitForTimeout(900);
  return page;
}

async function capture(filename, prepare) {
  const page = await createPage();
  await prepare(page);
  await page.waitForTimeout(650);
  await page.screenshot({
    path: path.join(outputDir, filename),
    animations: "disabled",
  });
  await page.close();
}

async function openAgents(page) {
  await page.getByRole("button", { name: "打开智能体" }).click();
  await page.getByRole("heading", { name: "AGENTS" }).waitFor();
}

async function openEarthAnswer(page) {
  await openAgents(page);
  await page.getByRole("button", { name: /MY AGENTS 私人知识与创作/ }).click();
  await page
    .getByRole("button", { name: /地球答案 \/ EARTH ANSWER/ })
    .click();
  await page.getByText("365-DAY EDITION", { exact: true }).waitFor();
}

async function openPodcast(page) {
  await openAgents(page);
  await page
    .getByRole("button", { name: /口袋播客 · POCKET PODCAST/ })
    .click();
  await page.getByRole("heading", { name: "POCKET PODCAST" }).waitFor();
}

await capture("01_公共Agents口袋播客入口_2x.png", async (page) => {
  await openAgents(page);
  await page.getByText("口袋播客 · POCKET PODCAST", { exact: true }).waitFor();
});

await capture("02_地球答案今天待揭晓_2x.png", async (page) => {
  await page.evaluate(() => localStorage.removeItem("pe.earth-answer.revealed.v1"));
  await openEarthAnswer(page);
  await page.getByRole("button", { name: "掷骰子揭晓今天的地球答案" }).waitFor();
});

await capture("03_地球答案软端揭晓结果_2x.png", async (page) => {
  await page.evaluate(() => localStorage.removeItem("pe.earth-answer.revealed.v1"));
  await openEarthAnswer(page);
  await page.getByRole("button", { name: "掷骰子揭晓今天的地球答案" }).click();
  await page.waitForTimeout(1_150);
  await page.getByText("TODAY'S ACTION", { exact: true }).waitFor();
});

await capture("04_口袋播客来源账本_2x.png", async (page) => {
  await openPodcast(page);
  await page.getByRole("button", { name: "文字模式" }).click();
  const article = page.locator("article").first();
  await article.waitFor();
  await article.scrollIntoViewIfNeeded();
});

await capture("05_口袋播客第二条静默预览_2x.png", async (page) => {
  await openPodcast(page);
  await page.getByRole("button", { name: "下一条" }).click();
  await page.getByText("NOW PLAYING · 2/2", { exact: true }).waitFor();
});

await browser.close();
console.log(`Captured 5 exclusive PPT screenshots at 860×1864 into ${outputDir}`);

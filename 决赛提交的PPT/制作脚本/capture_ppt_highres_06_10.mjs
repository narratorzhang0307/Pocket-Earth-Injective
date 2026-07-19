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
  "/Users/zhangcheng/Desktop/Pocket-Earth-Injective/决赛提交的PPT/PocketEarth_Injective_决赛产品全景截图库_2026-07-19/11_PPT高清源图_第6-10页_2x";
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
  await page.waitForTimeout(900);
  return page;
}

async function capture(filename, prepare = async () => {}) {
  const page = await createPage();
  await prepare(page);
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(outputDir, filename),
    animations: "disabled",
  });
  await page.close();
}

async function openPrivateAgents(page) {
  await page.getByText("Agents", { exact: true }).click();
  await page.waitForTimeout(700);
  await page.getByText("MY AGENTS", { exact: true }).click();
  await page.waitForTimeout(700);
}

async function openAgent(page, text) {
  await openPrivateAgents(page);
  const button = page.locator("button").filter({ hasText: text }).first();
  await button.click();
  await page.waitForTimeout(700);
}

async function fillJotAndWait(page) {
  await openAgent(page, "jot-agent");
  await page
    .locator("textarea")
    .fill("上周去了京都，在鸭川边读完《百年孤独》");
  await page.getByRole("button", { name: "记一笔 ◍" }).last().click();
  await page.getByText("确认钉到地球", { exact: true }).waitFor({ timeout: 35_000 });
}

await capture("01_JOT一个框记一切_2x.png", async (page) => {
  await openAgent(page, "jot-agent");
});

await capture("02_PhotosAgent端侧整理_2x.png", async (page) => {
  await openAgent(page, "photos-agent");
});

await capture("03_JOT定位与用户确认_2x.png", async (page) => {
  await fillJotAndWait(page);
});

await capture("04_JOT确认后钉回地球_2x.png", async (page) => {
  await fillJotAndWait(page);
  await page.getByText("确认钉到地球", { exact: true }).click();
  await page.waitForTimeout(900);
});

await capture("05_Frost总Agent人格入口_2x.png", async (page) => {
  await openAgent(page, "我是弗洛斯特");
});

await capture("06_Photos杂志视图_2x.png", async (page) => {
  await page.getByText("Photos", { exact: true }).click();
  await page.waitForTimeout(900);
});

await capture("07_Photos杂志年度内页_2x.png", async (page) => {
  await page.getByText("Photos", { exact: true }).click();
  await page.waitForTimeout(900);
  await page.locator("button").filter({ hasText: "PE-2025-光阴" }).first().click();
  await page.waitForTimeout(900);
});

await capture("08_Photos日历视图_2x.png", async (page) => {
  await page.getByText("Photos", { exact: true }).click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "日历" }).click();
  await page.waitForTimeout(700);
});

await capture("09_MyAgents私人控制台_2x.png", async (page) => {
  await openPrivateAgents(page);
});

await capture("10_PrivateMap城市级缩放_2x.png", async (page) => {
  await page.mouse.move(228, 510);
  await page.mouse.wheel(0, -1_400);
  await page.waitForTimeout(1_500);
});

await capture("11_AgentForge声明式创建_2x.png", async (page) => {
  await openAgent(page, "AGENT-FORGE");
});

await browser.close();
console.log(`Captured 11 unique PPT screenshots at 860×1864 into ${outputDir}`);

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
  "/Users/zhangcheng/Desktop/Pocket-Earth-Injective/决赛提交的PPT/PocketEarth_Injective_决赛产品全景截图库_2026-07-19/14_PPT高清源图_第21-25页_2x";
const executablePath =
  process.env.POCKET_EARTH_CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const chronicleTx =
  "https://testnet.blockscout.injective.network/tx/0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7";
const residence47Tx =
  "https://testnet.blockscout.injective.network/tx/0xcf4dc926da06cacef67e9e52f9b8fab192d3c26a0b59ebfee0a5f8326d3ffb2b";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath });

async function createPage(url = baseUrl) {
  const page = await browser.newPage({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });
  const external = !url.startsWith("http://127.0.0.1:");
  await page.goto(url, {
    waitUntil: external ? "domcontentloaded" : "networkidle",
    timeout: 45_000,
  });
  await page.waitForTimeout(external ? 6_000 : 900);
  return page;
}

async function capture(filename, url = baseUrl, prepare = async () => {}) {
  const page = await createPage(url);
  await prepare(page);
  await page.waitForTimeout(750);
  await page.screenshot({
    path: path.join(outputDir, filename),
    animations: "disabled",
  });
  await page.close();
}

async function openPublicEarth(page) {
  await page.getByRole("button", { name: "PUBLIC EARTH 公共地球" }).click();
  await page.waitForTimeout(1_100);
}

async function openPodcast(page) {
  await openPublicEarth(page);
  await page.getByRole("button", { name: "口袋播客" }).click();
  await page.getByRole("heading", { name: "POCKET PODCAST" }).waitFor();
}

await capture("01_口袋播客每日主持_2x.png", baseUrl, async (page) => {
  await openPodcast(page);
  await page.getByText(/NOW PLAYING/).waitFor();
});

await capture("02_金融知识便签展开_2x.png", baseUrl, async (page) => {
  await openPublicEarth(page);
  await page
    .getByRole("button", {
      name: /查看英国.*金融新闻|查看英国.*伦敦.*金融新闻/,
    })
    .click();
  await page.getByRole("button", { name: "返回全球新闻视图" }).waitFor();
});

await capture("03_科学知识完整证据_2x.png", baseUrl, async (page) => {
  await openPublicEarth(page);
  await page.getByRole("button", { name: "知识详情" }).click();
  await page.waitForTimeout(450);
  await page.getByRole("button", { name: "科学 2 条" }).click();
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByText("VERIFICATION PATH · 核验路径", { exact: true }).waitFor();
});

await capture("04_知识版次Blockscout成功_2x.png", chronicleTx, async (page) => {
  await page.getByRole("heading", { name: "Transaction details" }).waitFor({ timeout: 30_000 });
});

await capture("05_Frost身份卡47北欧极光客_2x.png", baseUrl, async (page) => {
  await openPublicEarth(page);
  await page.getByRole("button", { name: "身份卡牌" }).click();
  await page.waitForTimeout(450);
  await page.getByRole("button", { name: "选择 北欧极光客 身份卡 PE-05-0047" }).click();
  await page.getByText("5 / 5 · SWIPE →", { exact: true }).waitFor();
});

await capture("06_口袋播客文字模式_2x.png", baseUrl, async (page) => {
  await openPodcast(page);
  await page.getByRole("button", { name: "文字模式" }).click();
  await page.waitForTimeout(500);
  await page.getByText("01 · AI", { exact: true }).waitFor();
});

await capture("07_政策知识便签展开_2x.png", baseUrl, async (page) => {
  await openPublicEarth(page);
  await page
    .getByRole("button", {
      name: /查看中国.*政策观察.*政策新闻/,
    })
    .click({ force: true });
  await page.getByRole("button", { name: "返回全球新闻视图" }).waitFor();
});

await capture("08_PublicEarth47门牌Blockscout成功_2x.png", residence47Tx, async (page) => {
  await page.getByRole("heading", { name: "Transaction details" }).waitFor({ timeout: 30_000 });
});

await browser.close();
console.log(`Captured 8 exclusive PPT screenshots at 860×1864 into ${outputDir}`);

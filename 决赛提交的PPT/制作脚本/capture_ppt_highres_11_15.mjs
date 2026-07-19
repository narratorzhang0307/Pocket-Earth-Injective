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
  "/Users/zhangcheng/Desktop/Pocket-Earth-Injective/决赛提交的PPT/PocketEarth_Injective_决赛产品全景截图库_2026-07-19/12_PPT高清源图_第11-15页_2x";
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
  await page.waitForTimeout(1100);
  return page;
}

async function capture(filename, prepare = async () => {}) {
  const page = await createPage();
  await prepare(page);
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(outputDir, filename),
    animations: "disabled",
  });
  await page.close();
}

async function openPrivateAgents(page) {
  await page.getByRole("button", { name: "打开智能体" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "MY AGENTS 私人知识与创作" }).click();
  await page.waitForTimeout(500);
}

async function openAgent(page, label) {
  await openPrivateAgents(page);
  const button = page.locator("button").filter({ hasText: label }).first();
  await button.click();
  await page.waitForTimeout(700);
}

async function openPublicEarth(page) {
  await page.getByRole("button", { name: "PUBLIC EARTH 公共地球" }).click();
  await page.waitForTimeout(1300);
}

await capture("01_BooksAgent真实RunTrace_2x.png", async (page) => {
  await openAgent(page, "books-agent");
  await page
    .getByRole("textbox", { name: "「我读了《百年孤独》五星」/ 发书封截图…" })
    .fill("我读了《趁生命气息逗留》五星");
  await page.getByRole("button", { name: "标记", exact: true }).click();
  await page.getByText("DRAFT · 待确认藏书票", { exact: true }).waitFor({ timeout: 35_000 });
});

await capture("02_AgentForge声明式安全审查_2x.png", async (page) => {
  await openAgent(page, "AGENT-FORGE");
  await page
    .getByRole("textbox", { name: "描述你想创建的空间 Agent" })
    .fill("帮我记录散步时遇到的城市建筑，补充建筑年代与风格，并按建筑所在地钉到地球");
  await page.getByRole("button", { name: "造 ✦", exact: true }).click();
  await page.getByText("安全审查通过", { exact: true }).waitFor({ timeout: 35_000 });
});

await capture("03_AgentPlaza播客摘要已安装_2x.png", async (page) => {
  await openAgent(page, "agent-plaza");
  const title = page.getByText("播客摘要", { exact: true });
  const card = title.locator("..").locator("..");
  const install = card.getByRole("button", { name: "▶ INSTALL", exact: true });
  if (await install.count()) {
    await install.click();
    await card.getByRole("button", { name: "✓ 已装", exact: true }).waitFor();
  }
});

await capture("04_PublicEarth敖德萨文化新闻地图_2x.png", async (page) => {
  await openPublicEarth(page);
  await page
    .getByRole("button", {
      name: "查看乌克兰 · 敖德萨的文化新闻：敖德萨考古博物馆强化战时保护能力",
    })
    .click();
  await page.getByRole("button", { name: "返回全球新闻视图" }).waitFor();
});

await capture("05_气候知识完整证据页_2x.png", async (page) => {
  await openPublicEarth(page);
  await page.getByRole("button", { name: "知识详情" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "气候 2 条" }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "展开阅读全文" }).click();
  await page.getByText("VERIFICATION PATH · 核验路径", { exact: true }).waitFor();
});

await capture("06_Frost身份卡46爵士夜行者_2x.png", async (page) => {
  await openPublicEarth(page);
  await page.getByRole("button", { name: "身份卡牌" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "选择 爵士夜行者 身份卡 PE-02-0046" }).click();
  await page.getByText("4 / 5 · SWIPE →", { exact: true }).waitFor();
});

await capture("07_PublicPlaza夜间链上见闻_2x.png", async (page) => {
  await openAgent(page, "public-plaza");
  await page.getByRole("button", { name: "夜间 · 回来报告" }).click();
  await page.getByText("今晚的报告 · 由你决定", { exact: true }).waitFor();
});

await browser.close();
console.log(`Captured 7 new PPT screenshots at 860×1864 into ${outputDir}`);

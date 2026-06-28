// 无人值守验证空间 Agent 广场：进 AGENTS tab → 点 agent-plaza 入口 → 断言关键文案/链上徽章/筛选器 + 截图 + 抓 console 报错。
// 用法：副本 dev 跑在 5173 → node INJECTIVE-INTEGRATION/verify-space-plaza.mjs
import puppeteer from 'puppeteer-core'
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_URL = process.env.PLAZA_BASE_URL || 'http://localhost:5173/?demo'
const OUT = '/tmp'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: 440, height: 1180, deviceScaleFactor: 2 },
})
const page = await browser.newPage()
const errors = []
const ignoredErrors = []
const recordError = (message) => {
  const text = String(message || '').slice(0, 220)
  if (text.includes('Failed to initialize WebGL')) ignoredErrors.push(text)
  else errors.push(text)
}
page.on('console', (m) => { if (m.type() === 'error') recordError(m.text()) })
page.on('pageerror', (e) => recordError('PAGEERROR: ' + e.message))
const clickText = (txt) => page.evaluate((t) => {
  const els = [...document.querySelectorAll('button, [role="button"], div, span, a')]
  const el = els.reverse().find((e) => (e.textContent || '').includes(t) && e.offsetParent !== null)
  if (el) { el.click(); return true }
  return false
}, txt)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const expect = (condition, message) => {
  if (!condition) throw new Error(message)
}

try {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  const clickedAgents = await clickText('Agents')
  console.log('点 Agents tab:', clickedAgents)
  expect(clickedAgents, 'Agents tab not found')
  await sleep(2600) // 等 MusicAgentsTab 懒加载
  const clickedPlaza = await clickText('空间 agent 广场') || await clickText('agent-plaza')
  console.log('点 agent-plaza 入口:', clickedPlaza)
  expect(clickedPlaza, 'agent-plaza entry not found')
  await sleep(2200)
  await page.screenshot({ path: OUT + '/space_plaza.png', fullPage: true })
  const txt = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 2200))
  expect(txt.includes('AGENT-PLAZA'), 'AGENT-PLAZA header missing')
  expect(txt.includes('有边界·有审核'), 'agent-plaza boundary strip missing')
  expect(txt.includes('PUBLISH · 发布你的 agent'), 'publish card missing')
  expect(txt.includes('Injective 链上身份'), 'Injective chain identity copy missing')
  expect(txt.includes('链上见闻'), 'on-chain sights agent missing')
  expect(txt.includes('咖啡地图'), 'cafe-map installable card missing')
  expect(txt.includes('全部') && txt.includes('免费') && txt.includes('付费') && txt.includes('端侧') && txt.includes('链上'), 'filter bar missing expected modes')
  expect(errors.length === 0, 'console/page errors:\n' + errors.join('\n'))
  console.log('\n=== 广场可见文本 ===\n' + txt)
  console.log('\n=== console 报错 ===\n' + (errors.length ? errors.join('\n') : '✅ 无'))
  if (ignoredErrors.length) console.log('\n=== 已忽略的 headless WebGL 噪声 ===\n' + ignoredErrors.join('\n'))
} catch (e) {
  console.error('脚本错:', e.message)
  process.exitCode = 1
} finally {
  await browser.close()
}

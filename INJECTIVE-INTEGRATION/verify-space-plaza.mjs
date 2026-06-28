// 无人值守验证空间 Agent 广场：进 AGENTS tab → 点 SPACE-PLAZA 入口 → 截图 + 抓 console 报错。
// 用法：副本 dev 跑在 5173 → node INJECTIVE-INTEGRATION/verify-space-plaza.mjs
import puppeteer from 'puppeteer-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = '/tmp'

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'],
  defaultViewport: { width: 440, height: 1180, deviceScaleFactor: 2 },
})
const page = await browser.newPage()
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 220)) })
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 220)))
const clickText = (txt) => page.evaluate((t) => {
  const els = [...document.querySelectorAll('button, [role="button"], div, span, a')]
  const el = els.reverse().find((e) => (e.textContent || '').includes(t) && e.offsetParent !== null)
  if (el) { el.click(); return true }
  return false
}, txt)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

try {
  await page.goto('http://localhost:5173/?demo', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  console.log('点 Agents tab:', await clickText('Agents'))
  await sleep(2600) // 等 MusicAgentsTab 懒加载
  console.log('点 SPACE-PLAZA 入口:', await clickText('SPACE-PLAZA'))
  await sleep(2200)
  await page.screenshot({ path: OUT + '/space_plaza.png', fullPage: true })
  const txt = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 2200))
  console.log('\n=== 广场可见文本 ===\n' + txt)
  console.log('\n=== console 报错 ===\n' + (errors.length ? errors.join('\n') : '✅ 无'))
} catch (e) { console.error('脚本错:', e.message) } finally { await browser.close() }

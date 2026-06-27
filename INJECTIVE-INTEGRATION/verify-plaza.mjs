// 无人值守验证 Agent Plaza 前端：用系统 Chrome（puppeteer-core）导航广场、截图、抓 console 报错。
// 用法：副本 dev 跑在 5173 → node INJECTIVE-INTEGRATION/verify-plaza.mjs
import puppeteer from 'puppeteer-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = '/tmp'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
  defaultViewport: { width: 440, height: 900, deviceScaleFactor: 2 },
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
  // ?demo：demoReset 清零后自动注入示例画像（验证「预置画像」功能，不再手动注入）
  await page.goto('http://localhost:5173/?demo', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  await page.screenshot({ path: OUT + '/inj_1_earth.png' })

  console.log('点 Agents tab:', await clickText('Agents'))
  await sleep(3000) // 等 MusicAgentsTab 懒加载完成
  await page.screenshot({ path: OUT + '/inj_2_agents.png' })

  // 点 public-plaza 卡片的 RUN 按钮（进广场）
  const plazaClick = await page.evaluate(() => {
    const all = [...document.querySelectorAll('*')]
    const label = all.find((e) => e.children.length === 0 && (e.textContent || '').trim() === 'public-plaza')
    if (!label) return 'no-label'
    let card = label
    for (let i = 0; i < 6 && card.parentElement; i++) { card = card.parentElement; if ([...card.querySelectorAll('button')].some((b) => /RUN/i.test(b.textContent || ''))) break }
    const run = [...card.querySelectorAll('button')].find((b) => /RUN/i.test(b.textContent || ''))
    if (run) { run.click(); return 'clicked-run' }
    card.click(); return 'clicked-card'
  })
  console.log('点 public-plaza:', plazaClick)
  await sleep(5000) // 等 list-agents 拉链上 agent
  await page.screenshot({ path: OUT + '/inj_3_plaza.png' })

  const plazaText = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 1800))
  console.log('\n=== 广场可见文本 ===\n' + plazaText)
  console.log('\n=== console 报错 ===\n' + (errors.length ? errors.join('\n') : '✅ 无'))
} catch (e) {
  console.error('脚本错:', e.message)
} finally {
  await browser.close()
}

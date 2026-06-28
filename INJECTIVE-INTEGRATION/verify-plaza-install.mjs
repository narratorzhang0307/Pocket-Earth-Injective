// 验证「添加 agent」闭环：进 agent-plaza → 点咖啡地图 INSTALL → 真进 customAgents → 切回 AGENTS tab 可见。
import puppeteer from 'puppeteer-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'], defaultViewport: { width: 440, height: 1180, deviceScaleFactor: 2 } })
const page = await browser.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message.slice(0, 160)))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const clickText = (t) => page.evaluate((t) => {
  const els = [...document.querySelectorAll('button, div, span, a')]
  const el = els.reverse().find((e) => (e.textContent || '').includes(t) && e.offsetParent !== null)
  if (el) { el.click(); return true } return false
}, t)
try {
  await page.goto('http://localhost:5173/?demo', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  console.log('点 Agents tab:', await clickText('Agents'))
  await sleep(2600)
  console.log('点 PLAZA·agent-plaza:', await clickText('空间 agent 广场'))
  await sleep(2200)
  // 在 agent plaza 点咖啡地图的 INSTALL
  const clicked = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('div')]
    const card = cards.find((d) => (d.textContent || '').includes('咖啡地图') && [...d.querySelectorAll('button')].some((b) => /INSTALL/i.test(b.textContent || '')))
    if (!card) return 'no-card'
    const btn = [...card.querySelectorAll('button')].find((b) => /INSTALL/i.test(b.textContent || ''))
    if (btn) { btn.click(); return 'clicked' } return 'no-btn'
  })
  console.log('点咖啡地图 INSTALL:', clicked)
  await sleep(1200)
  const custom = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pe.customAgents.v1') || '[]').map((a) => a.name + '/' + a.emoji) } catch { return 'err' } })
  console.log('→ customAgents 存储:', JSON.stringify(custom))
  await page.screenshot({ path: '/tmp/plaza_install.png', fullPage: true })
  // 返回 AGENTS tab（顶部第一个 button = 返回钮）
  await page.evaluate(() => { const b = document.querySelector('button'); if (b) b.click() })
  await sleep(1600)
  const txt = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 700))
  console.log('\n=== 切回 AGENTS tab 顶部所见 ===\n' + txt)
  await page.screenshot({ path: '/tmp/agents_after.png', fullPage: true })
  console.log('\n=== pageerror ===', errs.length ? errs.join('\n') : '✅ 无')
} catch (e) { console.error('脚本错:', e.message) } finally { await browser.close() }

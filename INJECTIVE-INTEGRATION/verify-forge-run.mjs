// 验证「我的 AGENT 点 RUN 直达运行页」：广场添加 agent → 返回 → 点它 → 应落 RunView（逐条整理/建图），非造物主创建页。
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
  await clickText('Agents'); await sleep(2600)
  await clickText('空间 agent 广场'); await sleep(2200)         // 进 agent-plaza
  // 点第一个免费 INSTALL（观鸟地图）
  await page.evaluate(() => {
    const card = [...document.querySelectorAll('div')].find((d) => (d.textContent || '').includes('观鸟地图') && [...d.querySelectorAll('button')].some((b) => /INSTALL/i.test(b.textContent || '')))
    const btn = card && [...card.querySelectorAll('button')].find((b) => /INSTALL/i.test(b.textContent || ''))
    if (btn) btn.click()
  })
  await sleep(1000)
  await page.evaluate(() => { const b = document.querySelector('button'); if (b) b.click() })  // 返回 AGENTS 入口
  await sleep(1600)
  // 点「我的 AGENT」区添加来的观鸟地图卡（整卡是 button）
  console.log('点我的 AGENT·观鸟地图:', await clickText('观鸟地图'))
  await sleep(1800)
  const txt = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 500))
  const isRunView = /逐条整理|建图/.test(txt)
  const isForge = /说一句话.*造|想造个什么/.test(txt)
  console.log('\n=== 点 RUN 后所见 ===\n' + txt)
  console.log('\n判定:', isRunView ? '✅ 直达 RunView 运行页' : isForge ? '✗ 落到造物主创建页（未修好）' : '? 其它')
  await page.screenshot({ path: '/tmp/forge_run.png', fullPage: true })
  console.log('pageerror:', errs.length ? errs.join('\n') : '✅ 无')
} catch (e) { console.error('脚本错:', e.message) } finally { await browser.close() }

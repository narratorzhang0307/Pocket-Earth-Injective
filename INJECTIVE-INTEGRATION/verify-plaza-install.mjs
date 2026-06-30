// 验证「添加 agent」闭环：进 agent-plaza → 点咖啡地图 INSTALL → 真进 customAgents → 切回 AGENTS 入口可见且可运行。
import puppeteer from 'puppeteer-core'
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_URL = process.env.PLAZA_BASE_URL || 'http://localhost:5173/?demo'
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: 440, height: 1180, deviceScaleFactor: 2 },
})
const page = await browser.newPage()
const errs = []
const ignoredErrs = []
const recordError = (message) => {
  const text = String(message || '').slice(0, 220)
  if (text.includes('Failed to initialize WebGL')) ignoredErrs.push(text)
  else errs.push(text)
}
page.on('console', (m) => { if (m.type() === 'error') recordError(m.text()) })
page.on('pageerror', (e) => recordError(e.message))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const expect = (condition, message) => {
  if (!condition) throw new Error(message)
}
const clickText = (t) => page.evaluate((t) => {
  const els = [...document.querySelectorAll('button, div, span, a')]
  const el = els.reverse().find((e) => (e.textContent || '').includes(t) && e.offsetParent !== null)
  if (el) { el.click(); return true } return false
}, t)
try {
  await page.evaluateOnNewDocument(() => localStorage.removeItem('pe.customAgents.v1'))
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.evaluate(() => localStorage.removeItem('pe.customAgents.v1'))
  await sleep(1800)
  const clickedAgents = await clickText('Agents')
  console.log('点 Agents 入口:', clickedAgents)
  expect(clickedAgents, 'Agents entry not found')
  await sleep(2600)
  const clickedPlaza = await clickText('空间 agent 广场')
  console.log('点 PLAZA·agent-plaza:', clickedPlaza)
  expect(clickedPlaza, 'agent-plaza entry not found')
  await sleep(2200)
  const plazaText = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n'))
  expect(plazaText.includes('AGENT-PLAZA'), 'AGENT-PLAZA header missing')
  expect(plazaText.includes('Injective testnet'), 'Injective chain identity badge missing')
  expect(plazaText.includes('链上见闻'), 'on-chain sights agent card missing')
  expect(plazaText.includes('咖啡地图'), 'cafe-map installable card missing')
  expect(plazaText.includes('有边界·有审核'), 'agent-plaza boundary status strip missing')
  // 在 agent plaza 点咖啡地图的 INSTALL
  const clicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')]
      .filter((b) => /INSTALL/i.test(b.textContent || ''))
    for (const btn of buttons) {
      let node = btn.parentElement
      while (node) {
        const text = node.textContent || ''
        if (text.includes('咖啡地图') && !text.includes('观鸟地图')) {
          btn.click()
          return 'clicked'
        }
        node = node.parentElement
      }
    }
    return buttons.length ? 'wrong-card' : 'no-btn'
  })
  console.log('点咖啡地图 INSTALL:', clicked)
  expect(clicked === 'clicked', `cafe-map install failed: ${clicked}`)
  await sleep(1200)
  const custom = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('pe.customAgents.v1') || '[]').map((a) => ({
        name: a.name,
        emoji: a.emoji,
        domain: a.domain,
        geoStrategy: a.geoStrategy,
        tagFields: a.tagFields,
        tools: a.tools,
      }))
    } catch { return 'err' }
  })
  console.log('→ customAgents 存储:', JSON.stringify(custom))
  expect(Array.isArray(custom), 'customAgents storage is not an array')
  const installedCafe = custom.find((a) => a.name === '咖啡地图')
  expect(installedCafe, '咖啡地图 was not installed into customAgents')
  expect(installedCafe.domain === '地点', `installed cafe-map domain mismatch: ${installedCafe.domain}`)
  expect(Array.isArray(installedCafe.geoStrategy) && installedCafe.geoStrategy.includes('origin'), 'installed cafe-map lost place geoStrategy')
  expect(Array.isArray(installedCafe.tagFields) && installedCafe.tagFields.includes('位置'), 'installed cafe-map lost visible place tag field')
  for (const tool of ['enrich', 'geocode', 'mark_place']) {
    expect(Array.isArray(installedCafe.tools) && installedCafe.tools.includes(tool), `installed cafe-map lost ${tool} tool`)
  }
  await page.screenshot({ path: '/tmp/plaza_install.png', fullPage: true })
  // 返回 AGENTS 入口（顶部第一个 button = 返回钮）
  await page.evaluate(() => { const b = document.querySelector('button'); if (b) b.click() })
  await sleep(1600)
  const txt = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 1400))
  expect(txt.includes('我的 AGENT'), 'custom agent section missing after returning to AGENTS')
  expect(txt.includes('咖啡地图'), 'installed cafe-map missing after returning to AGENTS')
  expect(txt.includes('▶ RUN'), 'installed cafe-map RUN action missing after returning to AGENTS')
  console.log('\n=== 切回 AGENTS 入口顶部所见 ===\n' + txt)
  await page.screenshot({ path: '/tmp/agents_after.png', fullPage: true })
  expect(errs.length === 0, 'console/page errors:\n' + errs.join('\n'))
  console.log('\n=== pageerror === ✅ 无')
  if (ignoredErrs.length) console.log('\n=== 已忽略的 headless WebGL 噪声 ===\n' + ignoredErrs.join('\n'))
} catch (e) {
  console.error('脚本错:', e.message)
  process.exitCode = 1
} finally {
  await browser.close()
}

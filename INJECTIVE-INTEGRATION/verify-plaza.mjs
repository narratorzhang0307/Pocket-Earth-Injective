// 无人值守验证 Agent Plaza 前端：用系统 Chrome（puppeteer-core）导航广场、截图、抓 console 报错。
// 用法：副本 dev 跑在 5173 → node INJECTIVE-INTEGRATION/verify-plaza.mjs
import puppeteer from 'puppeteer-core'
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE_URL = process.env.PLAZA_BASE_URL || 'http://localhost:5173/?demo'
const OUT = '/tmp'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: 440, height: 900, deviceScaleFactor: 2 },
})
const page = await browser.newPage()
const errors = []
const ignoredErrors = []
const listAgentResponses = []
const listAgentUrls = []
const recordError = (message) => {
  const text = String(message || '').slice(0, 220)
  // Headless Chrome can fail WebGL before the script opens AGENTS; it is not a plaza/API regression.
  if (text.includes('Failed to initialize WebGL')) ignoredErrors.push(text)
  else errors.push(text)
}
page.on('console', (m) => { if (m.type() === 'error') recordError(m.text()) })
page.on('pageerror', (e) => recordError('PAGEERROR: ' + e.message))
page.on('response', async (res) => {
  const url = res.url()
  if (!url.includes('/api/injective') || !url.includes('tool=list-agents')) return
  listAgentUrls.push(url)
  try {
    listAgentResponses.push({ status: res.status(), body: await res.json() })
  } catch (e) {
    listAgentResponses.push({ status: res.status(), error: String(e?.message || e) })
  }
})

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
  // ?demo：demoReset 清零后自动注入示例画像（验证「预置画像」功能，不再手动注入）
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await sleep(1800)
  await page.screenshot({ path: OUT + '/inj_1_earth.png' })

  const clickedAgents = await clickText('Agents')
  console.log('点 Agents 入口:', clickedAgents)
  expect(clickedAgents, 'Agents entry not found')
  await sleep(3000) // 等 Agents 面板懒加载完成
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
  expect(plazaClick !== 'no-label', 'public-plaza card not found')
  await sleep(5000) // 等 list-agents 拉链上 agent
  await page.screenshot({ path: OUT + '/inj_3_plaza.png' })

  const plazaText = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 1800))
  const chainPayload = listAgentResponses.at(-1)
  const chainUrl = listAgentUrls.at(-1) || ''
  expect(chainPayload, 'list-agents API was not requested')
  expect(chainUrl.includes('builderCode=pocket-earth'), `list-agents did not use builderCode filter: ${chainUrl}`)
  expect(chainPayload.status === 200, `list-agents HTTP ${chainPayload.status}`)
  expect(!chainPayload.error, `list-agents JSON parse failed: ${chainPayload.error}`)
  expect(chainPayload.body?.builderCode === 'pocket-earth', `list-agents builderCode response mismatch: ${chainPayload.body?.builderCode}`)
  const agents = Array.isArray(chainPayload.body?.agents) ? chainPayload.body.agents : []
  const ids = agents.map((a) => String(a?.agentId ?? ''))
  expect(agents.length > 0, 'list-agents returned no on-chain agents')
  expect(ids.includes('43'), `agentId 43 missing from list-agents response: [${ids.join(', ')}]`)
  expect(agents.every((a) => String(a?.builderCode || '').toLowerCase() === 'pocket-earth'), 'non-pocket-earth agent returned from filtered list-agents response')
  expect(plazaText.includes('PUBLIC-PLAZA'), 'PUBLIC-PLAZA header missing')
  expect(plazaText.includes('INJECTIVE 链上'), 'Injective on-chain stat strip missing')
  expect(/Injective #4[3-7]/.test(plazaText), 'on-chain agent badge missing from plaza UI')
  expect(errors.length === 0, 'console/page errors:\n' + errors.join('\n'))
  console.log('\n=== 广场可见文本 ===\n' + plazaText)
  console.log('\n=== list-agents 摘要 ===')
  console.log(JSON.stringify({ count: agents.length, ids, builderCode: chainPayload.body?.builderCode, pocketEarth: agents.filter((a) => a?.builderCode === 'pocket-earth').length }, null, 2))
  console.log('\n=== console 报错 ===\n' + (errors.length ? errors.join('\n') : '✅ 无'))
  if (ignoredErrors.length) console.log('\n=== 已忽略的 headless WebGL 噪声 ===\n' + ignoredErrors.join('\n'))
} catch (e) {
  console.error('脚本错:', e.message)
  process.exitCode = 1
} finally {
  await browser.close()
}

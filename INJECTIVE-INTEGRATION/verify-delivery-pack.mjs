// Verify the public review entrypoints point to the Injective repo, demo, and review APIs.
// Usage: npm run verify:delivery
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  DEMO_VIDEO_URL,
  DEMO_VIDEO_LIMIT_SECONDS,
  HARDWARE_BRIDGE_URL,
  HARDWARE_BRIDGE_PROOF,
  JUDGE_QUICKSTART_URL,
  LIVE_DEMO_URL,
  MARKET_LANDSCAPE_BOUNDARY,
  ROADMAP_SAFETY_BOUNDARY,
  DELIVERY_CHECKLIST,
  REVIEW_ENTRYPOINTS,
  INTEGRATION_REPOSITORY_URL,
} from './chain-proof-data.mjs'

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual) !== String(expected)) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

async function callEvidenceApi() {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL('http://localhost/api/injective?tool=get-chain-evidence'), { network: 'testnet' })
  assertEqual('evidence HTTP status', statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue('evidence has no api error', !payload.error)
  return payload
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const readme = await readFile('README.md', 'utf8')
const chainEvidence = await readFile('INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md', 'utf8')
const demoScript = await readFile('INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', 'utf8')
const judgeQuickstart = await readFile('INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md', 'utf8')
const evidence = await callEvidenceApi()
const links = evidence.reviewEntrypoints
const checklist = evidence.deliveryChecklist
const expectedByKey = new Map(REVIEW_ENTRYPOINTS.map((item) => [item.key, item]))
const checklistByKey = new Map(DELIVERY_CHECKLIST.map((item) => [item.key, item]))
const linkKeys = new Set(REVIEW_ENTRYPOINTS.map((item) => item.key))

assertTrue('reviewEntrypoints array', Array.isArray(links))
assertEqual('reviewEntrypoints count', links.length, REVIEW_ENTRYPOINTS.length)
assertEqual('reviewEntrypoints unique key count', new Set(links.map((item) => item.key)).size, links.length)
assertEqual('delivery command', evidence.verification?.deliveryPack, 'npm run verify:delivery')
assertEqual('delivery script', packageJson.scripts?.['verify:delivery'], 'node INJECTIVE-INTEGRATION/verify-delivery-pack.mjs')
assertEqual('github repo command', evidence.verification?.githubRepo, 'npm run verify:github')
assertEqual('github repo script', packageJson.scripts?.['verify:github'], 'node INJECTIVE-INTEGRATION/verify-github-integration.mjs')
assertEqual('source control command', evidence.verification?.sourceControl, 'npm run verify:source')
assertEqual('source control script', packageJson.scripts?.['verify:source'], 'node INJECTIVE-INTEGRATION/verify-source-control.mjs')
assertEqual('registry events command', evidence.verification?.registryEvents, 'npm run verify:registry')
assertEqual('registry events script', packageJson.scripts?.['verify:registry'], 'node INJECTIVE-INTEGRATION/verify-registry-events.mjs')
assertEqual('pitch notes command', evidence.verification?.pitchNotes, 'npm run verify:pitch')
assertEqual('pitch notes script', packageJson.scripts?.['verify:pitch'], 'node INJECTIVE-INTEGRATION/verify-pitch-notes.mjs')
assertEqual('judge quickstart command', evidence.verification?.judgeQuickstart, 'npm run verify:judge')
assertEqual('judge quickstart script', packageJson.scripts?.['verify:judge'], 'node INJECTIVE-INTEGRATION/verify-judge-quickstart.mjs')
assertEqual('demo duration command', evidence.verification?.demoDuration, 'npm run verify:duration')
assertEqual('demo duration script', packageJson.scripts?.['verify:duration'], 'node INJECTIVE-INTEGRATION/verify-demo-duration.mjs')
assertEqual('wallet timeline command', evidence.verification?.walletTimeline, 'npm run verify:wallet')
assertEqual('wallet timeline script', packageJson.scripts?.['verify:wallet'], 'node INJECTIVE-INTEGRATION/verify-wallet-timeline-api.mjs')
assertEqual('public read APIs command', evidence.verification?.publicReadApis, 'npm run verify:public-apis')
assertEqual('public read APIs script', packageJson.scripts?.['verify:public-apis'], 'node INJECTIVE-INTEGRATION/verify-public-read-apis.mjs')
assertEqual('demo video limit seconds', evidence.demoVideoLimitSeconds, DEMO_VIDEO_LIMIT_SECONDS)

for (const expected of REVIEW_ENTRYPOINTS) {
  const actual = links.find((item) => item.key === expected.key)
  assertTrue(`reviewEntrypoints includes ${expected.key}`, Boolean(actual))
  assertEqual(`${expected.key} label`, actual.label, expected.label)
  assertEqual(`${expected.key} type`, actual.type, expected.type)
  if (expected.url) assertEqual(`${expected.key} url`, actual.url, expected.url)
  if (expected.path) assertEqual(`${expected.key} path`, actual.path, expected.path)
}

assertEqual('repository url', expectedByKey.get('github-repo').url, INTEGRATION_REPOSITORY_URL)
assertTrue('repository url points at Injective repo', INTEGRATION_REPOSITORY_URL.endsWith('/Pocket-Earth-Injective'))
assertTrue('repository url is not the old plus repo', !INTEGRATION_REPOSITORY_URL.includes('Pocket-Earth-Plus'))
assertTrue('repository url is not the sunset repo', !INTEGRATION_REPOSITORY_URL.includes('Sunset-Radio'))
assertEqual('judge quickstart url', expectedByKey.get('judge-quickstart').url, JUDGE_QUICKSTART_URL)
assertTrue('judge quickstart url points at integration guide', JUDGE_QUICKSTART_URL.endsWith('/INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md'))
assertTrue('judge quickstart url stays in integration repo', JUDGE_QUICKSTART_URL.startsWith(INTEGRATION_REPOSITORY_URL))
assertEqual('sourceControl repository', evidence.sourceControl?.repository, INTEGRATION_REPOSITORY_URL)
assertEqual('sourceControl branch', evidence.sourceControl?.branch, 'main')
assertTrue('sourceControl commit is sha or null', evidence.sourceControl?.commit === null || /^[0-9a-f]{40}$/i.test(evidence.sourceControl?.commit))

assertEqual('live demo url', expectedByKey.get('live-demo').url, LIVE_DEMO_URL)
assertTrue('live demo url includes demo seed', LIVE_DEMO_URL.endsWith('/?demo'))
assertTrue('live demo url uses Pocket Earth domain', LIVE_DEMO_URL.startsWith('https://pocketearth.throughtheglass.art/'))
assertEqual('demo video url', expectedByKey.get('demo-video').url, DEMO_VIDEO_URL)
assertTrue('demo video url uses youtu.be', DEMO_VIDEO_URL.startsWith('https://youtu.be/'))
assertEqual('demo video type', expectedByKey.get('demo-video').type, 'video')

assertEqual('chain evidence API path', expectedByKey.get('chain-evidence-api').path, '/api/injective?tool=get-chain-evidence')
assertEqual('agent proof API path', expectedByKey.get('agent-proof-api').path, '/api/injective?tool=get-agent-proof&agentId=43')
assertEqual('agent fleet API path', expectedByKey.get('agent-fleet-api').path, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`)
assertEqual('wallet timeline API path', expectedByKey.get('wallet-timeline-api').path, '/api/injective?tool=get-wallet-timeline')
assertEqual('hardware bridge API path', expectedByKey.get('hardware-bridge-api').path, '/api/injective?tool=get-hardware-bridge-proof')
assertEqual('hardware bridge url', expectedByKey.get('hardware-bridge').url, HARDWARE_BRIDGE_URL)
assertTrue('hardware bridge url stays in integration repo', HARDWARE_BRIDGE_URL.startsWith(INTEGRATION_REPOSITORY_URL))
assertEqual('evidence hardware Pi adapter path', evidence.hardwareBridge?.piAdapter?.modulePath, HARDWARE_BRIDGE_PROOF.piAdapter.modulePath)
assertTrue('evidence hardware Pi adapter exposes state action', evidence.hardwareBridge?.piAdapter?.actions?.includes('state'))
assertTrue('evidence hardware Pi adapter exposes tts action', evidence.hardwareBridge?.piAdapter?.actions?.includes('tts'))
assertTrue('evidence hardware Pi adapter exposes display action', evidence.hardwareBridge?.piAdapter?.actions?.includes('display'))
assertEqual('evidence hardware roadmap current', evidence.hardwareBridge?.roadmapBoundary?.current, HARDWARE_BRIDGE_PROOF.roadmapBoundary.current)
assertTrue('evidence hardware roadmap keeps optional adapters', String(evidence.hardwareBridge?.roadmapBoundary?.integrationRule || '').includes('optional/removable'))
assertEqual('evidence hardware service boundary key', evidence.hardwareBridge?.serviceBoundary?.key, HARDWARE_BRIDGE_PROOF.serviceBoundary.key)
assertTrue('evidence hardware service receipt slot', String(evidence.hardwareBridge?.serviceBoundary?.futureReceiptSlot || '').includes('hardwareNodeServiceReceipt'))
assertTrue('evidence hardware service ties to Agent Plaza receipts', String(evidence.hardwareBridge?.serviceBoundary?.agentPlazaTieIn || '').includes('Agent Plaza service receipts'))
assertEqual('evidence market landscape key', evidence.marketLandscapeBoundary?.key, MARKET_LANDSCAPE_BOUNDARY.key)
assertTrue('evidence market landscape flywheel array', Array.isArray(evidence.marketLandscapeBoundary?.commercialFlywheel))
assertTrue(
  'evidence market landscape flywheel matches constants',
  MARKET_LANDSCAPE_BOUNDARY.commercialFlywheel.every((item) => evidence.marketLandscapeBoundary?.commercialFlywheel?.includes(item)),
)
assertEqual('evidence market landscape preferred path', evidence.marketLandscapeBoundary?.preferredPath?.label, MARKET_LANDSCAPE_BOUNDARY.preferredPath.label)
assertTrue('evidence market landscape names manifest review', String(evidence.marketLandscapeBoundary?.preferredPath?.proof || '').includes('manifest review'))
assertTrue('evidence market landscape names willEmit dry-run', String(evidence.marketLandscapeBoundary?.preferredPath?.proof || '').includes('willEmit'))
assertTrue(
  'evidence market landscape negative coordinates match constants',
  MARKET_LANDSCAPE_BOUNDARY.negativeCoordinates.every((item) => evidence.marketLandscapeBoundary?.negativeCoordinates?.some((actual) => actual.key === item.key)),
)
assertTrue('evidence market landscape pure-social coordinate cites public-plaza', evidence.marketLandscapeBoundary?.negativeCoordinates?.some((item) => item.key === 'pure-social' && item.examples?.includes('friend.tech') && item.pocketEarthBoundary.includes('public-plaza')))
assertTrue('evidence market landscape token-first coordinate cites Agent Plaza', evidence.marketLandscapeBoundary?.negativeCoordinates?.some((item) => item.key === 'token-first-agent-market' && item.examples?.includes('Virtuals-style agent token path') && item.pocketEarthBoundary.includes('Agent Plaza')))
assertTrue('evidence market landscape hardware-first coordinate cites Frost Edge Node', evidence.marketLandscapeBoundary?.negativeCoordinates?.some((item) => item.key === 'consumer-ai-hardware-first' && item.examples?.includes('Rabbit r1') && item.pocketEarthBoundary.includes('Frost Edge Node')))
assertTrue(
  'evidence market landscape rejected paths match constants',
  MARKET_LANDSCAPE_BOUNDARY.rejectedPaths.every((item) => evidence.marketLandscapeBoundary?.rejectedPaths?.some((actual) => actual.key === item.key)),
)
assertTrue('evidence market landscape rejects hardware revenue first', evidence.marketLandscapeBoundary?.rejectedPaths?.some((item) => item.key === 'hardware-revenue-first' && item.boundary.includes('developer-kit')))
assertTrue('evidence market landscape names differentiation', MARKET_LANDSCAPE_BOUNDARY.differentiation.every((item) => evidence.marketLandscapeBoundary?.differentiation?.includes(item)))
assertEqual('evidence market landscape local verification', evidence.marketLandscapeBoundary?.localVerification, MARKET_LANDSCAPE_BOUNDARY.localVerification)
assertEqual('evidence roadmap safety key', evidence.roadmapSafetyBoundary?.key, ROADMAP_SAFETY_BOUNDARY.key)
assertTrue('evidence roadmap safety product roadmap array', Array.isArray(evidence.roadmapSafetyBoundary?.productRoadmap))
assertTrue('evidence roadmap safety chain roadmap array', Array.isArray(evidence.roadmapSafetyBoundary?.chainRoadmap))
assertTrue(
  'evidence roadmap safety always-on boundaries match constants',
  ROADMAP_SAFETY_BOUNDARY.alwaysOn.every((boundary) => evidence.roadmapSafetyBoundary?.alwaysOn?.includes(boundary)),
)
assertTrue(
  'evidence roadmap safety P2 keeps learned skills declarative',
  evidence.roadmapSafetyBoundary?.productRoadmap?.some((item) => item.phase === 'P2 self-learning' && item.boundary.includes('never execute arbitrary code')),
)
assertTrue(
  'evidence roadmap safety P4 keeps hardware from signing',
  evidence.roadmapSafetyBoundary?.chainRoadmap?.some((item) => item.phase === 'P4 Frost Network' && item.boundary.includes('devices do not sign wallets')),
)

console.log('\nDelivery checklist')
assertTrue('deliveryChecklist array', Array.isArray(checklist))
assertEqual('deliveryChecklist count', checklist.length, DELIVERY_CHECKLIST.length)
assertEqual('deliveryChecklist unique key count', new Set(checklist.map((item) => item.key)).size, checklist.length)
for (const expected of DELIVERY_CHECKLIST) {
  const actual = checklist.find((item) => item.key === expected.key)
  assertTrue(`deliveryChecklist includes ${expected.key}`, Boolean(actual))
  assertEqual(`${expected.key} requirement`, actual.requirement, expected.requirement)
  assertEqual(`${expected.key} status`, actual.status, expected.status)
  assertEqual(`${expected.key} evidence`, actual.evidence, expected.evidence)
  assertEqual(`${expected.key} localCheck`, actual.localCheck, expected.localCheck)
  assertEqual(`${expected.key} linkKey`, actual.linkKey, expected.linkKey)
  assertTrue(`${expected.key} linkKey points to reviewEntrypoints`, linkKeys.has(actual.linkKey))
  if (actual.localCheck.startsWith('npm run ')) {
    const scriptName = actual.localCheck.replace('npm run ', '')
    assertTrue(`${expected.key} npm script exists`, Boolean(packageJson.scripts?.[scriptName]))
  }
}
assertEqual('GitHub checklist status', checklistByKey.get('public-github-readme').status, 'ready')
assertEqual('GitHub checklist local check', checklistByKey.get('public-github-readme').localCheck, 'npm run verify:github')
assertEqual('Injective checklist status', checklistByKey.get('injective-integration').status, 'ready')
assertEqual('Demo checklist status', checklistByKey.get('demo-video-script').status, 'ready')
assertEqual('Demo checklist local check', checklistByKey.get('demo-video-script').localCheck, 'npm run verify:duration')
assertEqual('Demo checklist link key', checklistByKey.get('demo-video-script').linkKey, 'demo-video')
assertTrue('Demo checklist evidence mentions public video', checklistByKey.get('demo-video-script').evidence.includes('Public demo video'))
assertEqual('Pitch checklist status', checklistByKey.get('pitch-deck-notes').status, 'ready-for-deck')
assertEqual('Pitch checklist local check', checklistByKey.get('pitch-deck-notes').localCheck, 'npm run verify:pitch')
assertEqual('Public API checklist local check', checklistByKey.get('public-review-apis').localCheck, 'npm run verify:public-proof')
assertTrue('checklist mentions no private keys', checklistByKey.get('public-review-apis').evidence.includes('without private keys') || checklistByKey.get('public-review-apis').evidence.includes('read-only'))
assertEqual('Frost Edge Node checklist status', checklistByKey.get('frost-edge-node').status, 'ready-prototype')
assertEqual('Frost Edge Node checklist local check', checklistByKey.get('frost-edge-node').localCheck, 'npm run verify:hardware')
assertTrue('Frost Edge Node checklist mentions JSONL', checklistByKey.get('frost-edge-node').evidence.includes('JSONL'))
assertTrue('Frost Edge Node checklist mentions Pi adapter', checklistByKey.get('frost-edge-node').evidence.includes('Pi event adapter'))
assertTrue('Frost Edge Node checklist mentions adapter actions', checklistByKey.get('frost-edge-node').evidence.includes('state/tts/display'))
assertTrue('Frost Edge Node checklist mentions piAdapter field', checklistByKey.get('frost-edge-node').evidence.includes('hardwareBridge.piAdapter'))
assertTrue('Frost Edge Node checklist mentions marketBoundary', checklistByKey.get('frost-edge-node').evidence.includes('hardwareBridge.marketBoundary'))
assertTrue('Frost Edge Node checklist mentions serviceBoundary', checklistByKey.get('frost-edge-node').evidence.includes('hardwareBridge.serviceBoundary'))
assertTrue('Frost Edge Node checklist mentions roadmapBoundary', checklistByKey.get('frost-edge-node').evidence.includes('hardwareBridge.roadmapBoundary'))
assertTrue('Frost Edge Node checklist mentions developer kit boundary', checklistByKey.get('frost-edge-node').evidence.includes('prototype/developer-kit'))
assertTrue('Frost Edge Node checklist mentions optional drivers', checklistByKey.get('frost-edge-node').evidence.includes('BLE/TTS/display drivers stay optional'))
assertTrue('Frost Edge Node checklist keeps Agent Plaza business path', checklistByKey.get('frost-edge-node').evidence.includes('Agent Plaza'))
assertTrue('Frost Edge Node checklist keeps service receipts boundary', checklistByKey.get('frost-edge-node').evidence.includes('Agent Plaza service receipts'))
assertTrue('Frost Edge Node checklist matches market role', HARDWARE_BRIDGE_PROOF.marketBoundary.role.includes('developer-kit'))
assertTrue('Frost Edge Node service boundary matches receipts', HARDWARE_BRIDGE_PROOF.serviceBoundary.futureReceiptSlot.includes('hardwareNodeServiceReceipt'))
assertEqual('Frost Edge Node Pi adapter action count', HARDWARE_BRIDGE_PROOF.piAdapter.actions.length, 3)
assertEqual('Frost Edge Node Pi adapter action contract', HARDWARE_BRIDGE_PROOF.piAdapter.actions.join('/'), 'state/tts/display')

assertTrue('README mentions live demo', readme.includes('https://pocketearth.throughtheglass.art'))
assertTrue('README mentions public demo video', readme.includes(DEMO_VIDEO_URL))
assertTrue('README names Injective core integration', readme.includes('Injective 核心集成'))
assertTrue('README links judge quickstart', readme.includes('INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md'))
assertTrue('README mentions judgeRunbook', readme.includes('judgeRunbook'))
assertTrue('CHAIN-EVIDENCE mentions review entrypoints', chainEvidence.includes('reviewEntrypoints'))
assertTrue('CHAIN-EVIDENCE mentions demo video entrypoint', chainEvidence.includes('reviewEntrypoints.demo-video') && chainEvidence.includes(DEMO_VIDEO_URL))
assertTrue('CHAIN-EVIDENCE mentions delivery checklist', chainEvidence.includes('deliveryChecklist'))
assertTrue('CHAIN-EVIDENCE mentions market landscape boundary', chainEvidence.includes('marketLandscapeBoundary'))
assertTrue('CHAIN-EVIDENCE mentions hardware service boundary', chainEvidence.includes('hardwareBridge.serviceBoundary'))
assertTrue('CHAIN-EVIDENCE mentions hardware node service receipt', chainEvidence.includes('hardwareNodeServiceReceipt'))
assertTrue('CHAIN-EVIDENCE mentions commercial flywheel', chainEvidence.includes('commercialFlywheel'))
assertTrue('CHAIN-EVIDENCE mentions negative coordinates', chainEvidence.includes('negativeCoordinates'))
assertTrue('CHAIN-EVIDENCE names deck negative examples', chainEvidence.includes('friend.tech / Lens / Farcaster') && chainEvidence.includes('Virtuals-style agent token path') && chainEvidence.includes('Humane AI Pin / Rabbit r1'))
assertTrue('CHAIN-EVIDENCE mentions rejected paths', chainEvidence.includes('rejectedPaths'))
assertTrue('CHAIN-EVIDENCE mentions roadmap safety boundary', chainEvidence.includes('roadmapSafetyBoundary'))
assertTrue('CHAIN-EVIDENCE mentions judge quickstart', chainEvidence.includes('JUDGE-QUICKSTART.md'))
assertTrue('CHAIN-EVIDENCE mentions judgeRunbook', chainEvidence.includes('judgeRunbook'))
assertTrue('CHAIN-EVIDENCE mentions Profile Chain roadmap proof', chainEvidence.includes('## 公开证据如何支撑 Profile Chain 路线图'))
assertTrue('CHAIN-EVIDENCE mentions Agent Plaza receipt loop', chainEvidence.includes('## Agent Plaza 回执如何形成收入闭环'))
assertTrue('CHAIN-EVIDENCE maps Agent Plaza revenue modes', chainEvidence.includes('订阅、单次调用或平台抽成路径') && chainEvidence.includes('平台抽成'))
assertTrue('CHAIN-EVIDENCE maps manifest receipt', chainEvidence.includes('manifestReceipt(agentId, manifestHash, publisher, timestamp)'))
assertTrue('CHAIN-EVIDENCE maps install receipt', chainEvidence.includes('installReceipt(agentId, manifestHash, userConsentHash, timestamp)'))
assertTrue('CHAIN-EVIDENCE maps call receipt', chainEvidence.includes('callReceipt(agentId, runId, capability, resultHash, timestamp)'))
assertTrue('CHAIN-EVIDENCE maps review receipt', chainEvidence.includes('reviewReceipt(agentId, ratingBucket, reasonHash, timestamp)'))
assertTrue('CHAIN-EVIDENCE maps payment receipt', chainEvidence.includes('paymentReceipt(agentId, planOrCallId, settlementRef, timestamp)'))
assertTrue('CHAIN-EVIDENCE maps NOW chain proof', chainEvidence.includes('NOW 链上身份与握手') && chainEvidence.includes('timelineSummary'))
assertTrue('CHAIN-EVIDENCE maps Profile Checkpoint boundary', chainEvidence.includes('P1 Profile Checkpoint') && chainEvidence.includes('profileHash + version + timestamp + Frost signature'))
assertTrue('CHAIN-EVIDENCE maps Agent Plaza receipts', chainEvidence.includes('P2 Agent Plaza receipts') && chainEvidence.includes('reviewManifest'))
assertTrue('CHAIN-EVIDENCE maps Profile Confidence', chainEvidence.includes('P3 Profile Confidence') && chainEvidence.includes('批量导入'))
assertTrue('CHAIN-EVIDENCE maps Frost Network boundary', chainEvidence.includes('P4 Frost Network') && chainEvidence.includes('设备不签名、不持私钥、不读取原始画像'))
assertTrue('CHAIN-EVIDENCE maps machine-readable market field', chainEvidence.includes('preferredPath') && chainEvidence.includes('Agent Plaza platform path'))
assertTrue('CHAIN-EVIDENCE locks Agent Plaza install smoke source', chainEvidence.includes('pe.customAgents.v1') && chainEvidence.includes('可重复的浏览器 smoke'))
assertTrue('CHAIN-EVIDENCE locks installed cafe-map manifest fields', chainEvidence.includes('domain=地点') && chainEvidence.includes('geoStrategy') && chainEvidence.includes('tagFields') && chainEvidence.includes('tools=[enrich, geocode, mark_place]'))
assertTrue('CHAIN-EVIDENCE locks install-to-run loop', chainEvidence.includes('INSTALL -> My Agents -> RUN') && chainEvidence.includes('RUN` 入口可见'))
assertTrue('DEMO-SCRIPT mentions delivery check', demoScript.includes('npm run verify:delivery'))
assertTrue('DEMO-SCRIPT mentions demo video entrypoint', demoScript.includes('reviewEntrypoints.demo-video') && demoScript.includes(DEMO_VIDEO_URL))
assertTrue('JUDGE-QUICKSTART mentions demo video entrypoint', judgeQuickstart.includes('reviewEntrypoints.demo-video') && judgeQuickstart.includes(DEMO_VIDEO_URL))
assertTrue('DEMO-SCRIPT mentions judge check', demoScript.includes('npm run verify:judge'))
assertTrue('DEMO-SCRIPT mentions judgeRunbook', demoScript.includes('judgeRunbook'))
assertTrue('DEMO-SCRIPT mentions market landscape boundary', demoScript.includes('marketLandscapeBoundary'))
assertTrue('DEMO-SCRIPT mentions market negative coordinates', demoScript.includes('negativeCoordinates') && demoScript.includes('PPT 第 34 页反面坐标'))
assertTrue('DEMO-SCRIPT mentions roadmap safety boundary', demoScript.includes('roadmapSafetyBoundary'))
assertTrue('DEMO-SCRIPT mentions 3-minute limit', demoScript.includes('≤ 3 分钟') && demoScript.includes('180s'))
assertTrue('DEMO-SCRIPT separates public-plaza from agent-plaza', demoScript.includes('public-plaza` 只讲链上社交发现') && demoScript.includes('agent-plaza` 才讲商业路径'))
assertTrue('DEMO-SCRIPT locks Agent Plaza install narration', demoScript.includes('INSTALL -> My Agents -> RUN') && demoScript.includes('domain=地点') && demoScript.includes('mark_place') && demoScript.includes('RUN` 入口'))
assertTrue('README links hardware bridge', readme.includes('hardware/frost-buddy/'))
assertTrue('README mentions market landscape boundary', readme.includes('marketLandscapeBoundary'))
assertTrue('README mentions Agent Plaza platform path', readme.includes('Agent Plaza platform path'))
assertTrue('README mentions market negative coordinates', readme.includes('negativeCoordinates') && readme.includes('PPT 第 34 页反面坐标') && readme.includes('friend.tech / Lens / Farcaster') && readme.includes('Humane AI Pin / Rabbit r1'))
assertTrue('README mentions roadmap safety boundary', readme.includes('roadmapSafetyBoundary'))
assertTrue('CHAIN-EVIDENCE mentions hardware check', chainEvidence.includes('npm run verify:hardware'))

const publicText = JSON.stringify({ links, checklist })
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB', '/Users/zhangcheng/Desktop', 'Pocket-Earth-Plus', 'Sunset-Radio']) {
  assertTrue(`delivery pack omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nOK reviewEntrypoints and deliveryChecklist point to the correct Injective review package.')

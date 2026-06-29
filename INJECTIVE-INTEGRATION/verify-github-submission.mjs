// Verify the public GitHub submission repo, review files, and origin boundary.
// Usage: npm run verify:github
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { INJECTIVE_TESTNET_CHAIN_ID, SUBMISSION_REPOSITORY_URL } from './chain-proof-data.mjs'

const integrationDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(integrationDir, '..')
const expectedRepo = new URL(SUBMISSION_REPOSITORY_URL)
const [, expectedOwner, expectedName] = expectedRepo.pathname.split('/')
const expectedSlug = `${expectedOwner}/${expectedName}`
const expectedGitUrl = `${SUBMISSION_REPOSITORY_URL}.git`
const forbiddenRepoSnippets = [
  'Pocket-Earth-Plus',
  'Sunset-Radio',
  'sunset-radio',
  '/Users/zhangcheng/Desktop/Pocket Earth',
]

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

function git(args) {
  return execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8' }).trim()
}

function normalizeGitUrl(value) {
  const text = String(value || '').trim()
  if (text.startsWith('git@github.com:')) {
    return `https://github.com/${text.slice('git@github.com:'.length).replace(/\.git$/, '')}`
  }
  return text.replace(/\.git$/, '')
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'Pocket-Earth-Injective-verify' } })
  if (res.status === 403) {
    console.log(`NOTE ${url} returned HTTP 403; falling back to public git/raw file checks.`)
    return null
  }
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`)
  return res.json()
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { accept: 'text/plain', 'user-agent': 'Pocket-Earth-Injective-verify' } })
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`)
  return res.text()
}

function assertNoOldRepoText(label, text) {
  for (const forbidden of forbiddenRepoSnippets) {
    assertTrue(`${label} omits ${forbidden}`, !text.includes(forbidden))
  }
}

console.log('Git origin boundary')
git(['fetch', 'origin', 'main', '--quiet'])
assertEqual('current branch', git(['branch', '--show-current']), 'main')
assertEqual('origin url', git(['remote', 'get-url', 'origin']), expectedGitUrl)
assertEqual('origin push url', git(['remote', 'get-url', '--push', 'origin']), expectedGitUrl)
assertEqual('normalized origin url', normalizeGitUrl(git(['remote', 'get-url', 'origin'])), SUBMISSION_REPOSITORY_URL)
const head = git(['rev-parse', 'HEAD'])
const originMain = git(['rev-parse', 'origin/main'])
const remoteMain = git(['ls-remote', '--heads', 'origin', 'main']).split(/\s+/)[0]
assertEqual('local HEAD matches origin/main', head, originMain)
assertEqual('remote main matches local HEAD', remoteMain, head)

console.log('\nGitHub public repository')
const repo = await fetchJson(`https://api.github.com/repos/${expectedSlug}`)
if (repo) {
  assertEqual('repo full_name', repo.full_name, expectedSlug)
  assertEqual('repo html_url', repo.html_url, SUBMISSION_REPOSITORY_URL)
  assertEqual('repo default branch', repo.default_branch, 'main')
  assertEqual('repo private flag', repo.private, false)
  assertTrue('repo is not archived', repo.archived === false)
  assertTrue('repo is public visibility', !repo.visibility || repo.visibility === 'public')
} else {
  assertTrue('public git ls-remote proved main is readable', Boolean(remoteMain))
}

console.log('\nGitHub raw review files')
const rawBase = `https://raw.githubusercontent.com/${expectedSlug}/${head}`
const remoteReadme = await fetchText(`${rawBase}/README.md`)
const remoteIntegration = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/README.md`)
const remoteEvidence = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md`)
const remoteDemo = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/DEMO-SCRIPT.md`)
const remoteJudge = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md`)
assertTrue('remote README names Injective submission', remoteReadme.includes('Injective 参赛版本'))
assertTrue('remote README names agentId 43', remoteReadme.includes('agentId 43'))
assertTrue('remote README points at chain evidence API', remoteReadme.includes('/api/injective?tool=get-chain-evidence'))
assertTrue('remote README names proof suite', remoteReadme.includes('npm run verify:injective'))
assertTrue('remote README names public proof guard', remoteReadme.includes('npm run verify:public-proof'))
assertTrue('remote README names public API guard', remoteReadme.includes('npm run verify:public-apis'))
assertTrue('remote README names integration guide guard', remoteReadme.includes('npm run verify:integration-guide'))
assertTrue('remote README names registry mint events', remoteReadme.includes('registryMintEvents'))
assertTrue('remote README names registry mint summary', remoteReadme.includes('registryMintSummary'))
assertTrue('remote README names registry mint checklist', remoteReadme.includes('registry-mint-events'))
assertTrue('remote README names wallet timeline status field', remoteReadme.includes('expectedStatus'))
assertTrue('remote README names wallet timeline summary', remoteReadme.includes('timelineSummary'))
assertTrue('remote README names direct wallet summary', remoteReadme.includes('返回 `summary`'))
assertTrue('remote README names wallet timeline in demo quick check', remoteReadme.includes('钱包时间线 API/RPC 事实表'))
assertTrue('remote README names judge quickstart submission link', remoteReadme.includes('含评审 60 秒入口的 `submissionLinks`'))
assertTrue('remote README names public read API manifest', remoteReadme.includes('publicReadApis'))
assertTrue('remote integration guide names ERC-8004', remoteIntegration.includes('ERC-8004'))
assertTrue('remote integration guide names wallet timeline', remoteIntegration.includes('get-wallet-timeline'))
assertTrue('remote integration guide names registryMintEvents', remoteIntegration.includes('registryMintEvents'))
assertTrue('remote integration guide names registryMintSummary', remoteIntegration.includes('registryMintSummary'))
assertTrue('remote integration guide names registry mint checklist', remoteIntegration.includes('registry-mint-events'))
assertTrue('remote integration guide names wallet timeline status field', remoteIntegration.includes('expectedStatus'))
assertTrue('remote integration guide names wallet timeline summary', remoteIntegration.includes('timelineSummary'))
assertTrue('remote integration guide names direct wallet summary', remoteIntegration.includes('summary, events'))
assertTrue('remote integration guide names wallet timeline in demo quick check', remoteIntegration.includes('钱包时间线 API/RPC 事实表'))
assertTrue('remote integration guide names judge quickstart submission link', remoteIntegration.includes('含评审 60 秒入口的 `submissionLinks`') || remoteIntegration.includes('直接链接 `JUDGE-QUICKSTART.md` 的 `submissionLinks`'))
assertTrue('remote integration guide names public read API manifest', remoteIntegration.includes('publicReadApis'))
assertTrue('remote integration guide names public API guard', remoteIntegration.includes('npm run verify:public-apis'))
assertTrue('remote integration guide names integration guide guard', remoteIntegration.includes('npm run verify:integration-guide'))
assertTrue('remote evidence pack names reviewBrief', remoteEvidence.includes('reviewBrief'))
assertTrue('remote evidence pack names registryMintEvents', remoteEvidence.includes('registryMintEvents'))
assertTrue('remote evidence pack names registryMintSummary', remoteEvidence.includes('registryMintSummary'))
assertTrue('remote evidence pack names registry mint checklist', remoteEvidence.includes('registry-mint-events'))
assertTrue('remote evidence pack names wallet timeline status field', remoteEvidence.includes('expectedStatus'))
assertTrue('remote evidence pack names wallet timeline summary', remoteEvidence.includes('timelineSummary'))
assertTrue('remote evidence pack names direct wallet summary', remoteEvidence.includes('all-succeeded status'))
assertTrue('remote evidence pack names judge quickstart submission link', remoteEvidence.includes('60-second judge quickstart') && remoteEvidence.includes('JUDGE-QUICKSTART.md'))
assertTrue('remote evidence pack names submissionChecklist', remoteEvidence.includes('submissionChecklist'))
assertTrue('remote evidence pack names public read API manifest', remoteEvidence.includes('publicReadApis'))
assertTrue('remote evidence pack names public API guard', remoteEvidence.includes('npm run verify:public-apis'))
assertTrue('remote demo script names registryMintEvents', remoteDemo.includes('registryMintEvents'))
assertTrue('remote demo script names registryMintSummary', remoteDemo.includes('registryMintSummary'))
assertTrue('remote demo script names registry mint checklist', remoteDemo.includes('registry-mint-events'))
assertTrue('remote demo script names wallet timeline status field', remoteDemo.includes('expectedStatus'))
assertTrue('remote demo script names wallet timeline summary', remoteDemo.includes('timelineSummary'))
assertTrue('remote demo script names direct wallet summary', remoteDemo.includes('get-wallet-timeline` 的 `summary`'))
assertTrue('remote demo script names judge quickstart submission link', remoteDemo.includes('submissionLinks') && remoteDemo.includes('固定评审 60 秒入口'))
assertTrue('remote demo script names public API guard', remoteDemo.includes('npm run verify:public-apis'))
assertTrue('remote demo script names integration guide guard', remoteDemo.includes('npm run verify:integration-guide'))
assertTrue('remote demo script keeps 3-minute limit', remoteDemo.includes('≤ 3 分钟') && remoteDemo.includes('180s'))
assertTrue('remote judge quickstart names Judge Quickstart', remoteJudge.includes('Judge Quickstart'))
assertTrue('remote judge quickstart names agentId 43', remoteJudge.includes('agentId 43'))
assertTrue('remote judge quickstart points at chain evidence API', remoteJudge.includes('/api/injective?tool=get-chain-evidence'))
assertTrue('remote judge quickstart points at builderCode fleet API', remoteJudge.includes('/api/injective?tool=list-agents&builderCode=pocket-earth'))
assertTrue('remote judge quickstart names recording focus', remoteJudge.includes('recordingOrder[].evidenceFocus'))
assertTrue('remote judge quickstart names registry mint summary', remoteJudge.includes('registryMintSummary'))
assertTrue('remote judge quickstart names wallet timeline summary', remoteJudge.includes('timelineSummary'))
assertTrue('remote judge quickstart names wallet timeline chainId', remoteJudge.includes(`chainId ${INJECTIVE_TESTNET_CHAIN_ID}`))
assertTrue('remote judge quickstart names public read API manifest', remoteJudge.includes('publicReadApis'))
assertTrue('remote judge quickstart names public API guard', remoteJudge.includes('npm run verify:public-apis'))
assertTrue('remote judge quickstart names integration guide guard', remoteJudge.includes('npm run verify:integration-guide'))
assertTrue('remote judge quickstart names source control guard', remoteJudge.includes('npm run verify:source'))
assertTrue('remote judge quickstart names judge guard', remoteJudge.includes('npm run verify:judge'))
assertTrue('remote judge quickstart names recording order guard', remoteJudge.includes('npm run verify:recording-order'))
assertTrue('remote judge quickstart names plaza split', remoteJudge.includes('public-plaza') && remoteJudge.includes('agent-plaza'))
for (const [label, text] of [
  ['remote README', remoteReadme],
  ['remote integration guide', remoteIntegration],
  ['remote evidence pack', remoteEvidence],
  ['remote demo script', remoteDemo],
  ['remote judge quickstart', remoteJudge],
]) {
  assertNoOldRepoText(label, text)
}

console.log('\nLocal submission config')
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'))
assertEqual('local verify:github script', packageJson.scripts?.['verify:github'], 'node INJECTIVE-INTEGRATION/verify-github-submission.mjs')
assertTrue('local package includes verify:submission', Boolean(packageJson.scripts?.['verify:submission']))
assertTrue('local package includes verify:injective', Boolean(packageJson.scripts?.['verify:injective']))
assertEqual('local verify:public-apis script', packageJson.scripts?.['verify:public-apis'], 'node INJECTIVE-INTEGRATION/verify-public-read-apis.mjs')
assertEqual('local verify:integration-guide script', packageJson.scripts?.['verify:integration-guide'], 'node INJECTIVE-INTEGRATION/verify-integration-guide.mjs')

console.log('\nOK GitHub submission repo is public, current, and bounded to Pocket-Earth-Injective.')

// Guard the public evidence API against source/repository drift.
// Usage: npm run verify:source
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleInjective } from '../injective-service.mjs'
import { SUBMISSION_REPOSITORY_URL } from './chain-proof-data.mjs'

const integrationDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(integrationDir, '..')

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
  if (text.startsWith('git@github.com:')) return `https://github.com/${text.slice('git@github.com:'.length).replace(/\.git$/, '')}`
  return text.replace(/\.git$/, '')
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

const evidence = await callEvidenceApi()
const head = git(['rev-parse', 'HEAD'])
const branch = git(['branch', '--show-current'])
const origin = normalizeGitUrl(git(['remote', 'get-url', 'origin']))
const remoteMain = git(['ls-remote', '--heads', 'origin', 'main']).split(/\s+/)[0]

console.log('\nLocal source boundary')
assertEqual('current branch', branch, 'main')
assertEqual('origin repository', origin, SUBMISSION_REPOSITORY_URL)
assertTrue('local HEAD is a 40-char sha', /^[0-9a-f]{40}$/i.test(head))

console.log('\nEvidence sourceControl')
assertTrue('sourceControl object', !!evidence.sourceControl && typeof evidence.sourceControl === 'object')
assertEqual('sourceControl repository', evidence.sourceControl.repository, SUBMISSION_REPOSITORY_URL)
assertEqual('sourceControl branch', evidence.sourceControl.branch, 'main')
assertEqual('sourceControl commit', evidence.sourceControl.commit, head)
assertEqual('sourceControl commitUrl', evidence.sourceControl.commitUrl, `${SUBMISSION_REPOSITORY_URL}/commit/${head}`)
assertEqual('sourceControl evidenceApi', evidence.sourceControl.evidenceApi, '/api/injective?tool=get-chain-evidence')
assertEqual('sourceControl command', evidence.verification?.sourceControl, 'npm run verify:source')

console.log('\nRemote source boundary')
assertTrue('origin/main is publicly readable', /^[0-9a-f]{40}$/i.test(remoteMain))

console.log('\nPublic-only guard')
const sourceText = JSON.stringify(evidence.sourceControl)
for (const forbidden of [
  'Pocket-Earth-Plus',
  'Sunset-Radio',
  'sunset-radio',
  '/Users/',
  '.env',
  'INJ_PRIVATE_KEY',
  'privateKey',
]) {
  assertTrue(`sourceControl omits ${forbidden}`, !sourceText.includes(forbidden))
}

console.log('\nOK sourceControl ties the public evidence API to the current Injective submission commit.')

// Run the plaza UI smoke checks. If no local app is running, start Vite and
// close it after the checks finish.
// Usage: npm run verify:plaza
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const HOST = process.env.PLAZA_HOST || '127.0.0.1'
const PORT = process.env.PLAZA_PORT || '5173'
const BASE_URL = process.env.PLAZA_BASE_URL || `http://${HOST}:${PORT}/?demo`
const HEALTH_URL = BASE_URL.replace(/\?.*$/, '/')

const CHECKS = [
  'INJECTIVE-INTEGRATION/verify-plaza.mjs',
  'INJECTIVE-INTEGRATION/verify-space-plaza.mjs',
  'INJECTIVE-INTEGRATION/verify-plaza-install.mjs',
]

async function canReach(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2000)
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function waitForApp(url) {
  for (let i = 0; i < 60; i += 1) {
    if (await canReach(url)) return
    await sleep(500)
  }
  throw new Error(`local app did not become reachable at ${url}`)
}

function startDevServer() {
  const child = spawn('npm', ['run', 'dev', '--', '--host', HOST, '--port', PORT], {
    cwd: process.cwd(),
    detached: true,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.on('data', (chunk) => process.stdout.write(`[vite] ${chunk}`))
  child.stderr.on('data', (chunk) => process.stderr.write(`[vite] ${chunk}`))
  child.on('exit', (code, signal) => {
    if (code !== null && code !== 0) process.stderr.write(`[vite] exited with code ${code}\n`)
    if (signal) process.stderr.write(`[vite] exited by ${signal}\n`)
  })
  return child
}

function stopDevServer(child) {
  if (!child?.pid) return
  try {
    process.kill(-child.pid, 'SIGTERM')
  } catch {
    child.kill('SIGTERM')
  }
}

function runCheck(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: process.cwd(),
      env: { ...process.env, PLAZA_BASE_URL: BASE_URL },
      stdio: 'inherit',
    })
    child.on('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(`${script} failed${signal ? ` by ${signal}` : ` with code ${code}`}`))
    })
    child.on('error', reject)
  })
}

let server = null
let startedServer = false

try {
  if (await canReach(HEALTH_URL)) {
    console.log(`Using existing app at ${BASE_URL}`)
  } else {
    console.log(`Starting local app at ${BASE_URL}`)
    server = startDevServer()
    startedServer = true
    await waitForApp(HEALTH_URL)
  }

  for (const check of CHECKS) {
    console.log(`\n[plaza smoke] ${check}`)
    await runCheck(check)
  }

  console.log('\nOK plaza smoke passed.')
} finally {
  if (startedServer) {
    stopDevServer(server)
    await sleep(500)
  }
}

import { pathToFileURL } from 'node:url'
import { buildLlmRequest, getLlmProviders } from '../frost-agent/provider-compat/runtime.mjs'

const REQUIRED_ENV = ['AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_DEPLOYMENT']
const REQUEST_ID_HEADERS = ['x-request-id', 'apim-request-id', 'x-ms-request-id']

function configuredAzureProvider(env) {
  return getLlmProviders({ ...env, FROST_LLM_PROVIDER: 'azure' })
    .find((provider) => provider.name === 'azure-model-router')
}

function missingAzureConfig(env) {
  return REQUIRED_ENV.filter((name) => !String(env[name] || '').trim())
}

export async function runFoundryLiveVerification({
  env = process.env,
  fetchImpl = fetch,
  strict = false,
  log = console.log,
} = {}) {
  const missing = missingAzureConfig(env)
  if (missing.length) {
    const message = `Foundry live verification SKIP · missing ${missing.join(', ')}`
    if (strict) throw new Error(message.replace('SKIP', 'FAILED'))
    log(message)
    return { ok: false, skipped: true, missing }
  }

  const provider = configuredAzureProvider(env)
  if (!provider) throw new Error('Foundry live verification FAILED · Azure provider configuration is invalid')

  const request = buildLlmRequest(provider, {
    messages: [{ role: 'user', content: 'Reply with exactly: POCKET_EARTH_FOUNDRY_OK' }],
    temperature: 0,
  })
  const timeoutMs = Number(env.FOUNDRY_LIVE_TIMEOUT_MS || 30000)
  let response
  try {
    response = await fetchImpl(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(request.body),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    const reason = error?.name === 'TimeoutError' ? 'request timed out' : 'request could not be completed'
    throw new Error(`Foundry live verification FAILED · ${reason}`)
  }

  if (!response.ok) throw new Error(`Foundry live verification FAILED · upstream HTTP ${response.status}`)

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Foundry live verification FAILED · upstream returned invalid JSON')
  }

  const model = String(data?.model || '').trim()
  const content = data?.choices?.[0]?.message?.content
  const requestId = REQUEST_ID_HEADERS.map((name) => response.headers.get(name)).find(Boolean) || ''
  if (!model) throw new Error('Foundry live verification FAILED · response has no model')
  if (typeof content !== 'string' || !content.trim()) throw new Error('Foundry live verification FAILED · response has no assistant content')
  if (!requestId) throw new Error('Foundry live verification FAILED · response has no Azure request id')

  const result = {
    ok: true,
    skipped: false,
    provider: provider.name,
    deployment: provider.model,
    model,
    requestId,
    status: response.status,
  }
  log(`Foundry live verification passed · provider ${result.provider} · model ${result.model} · request ${requestId}`)
  return result
}

async function main() {
  const strict = process.argv.includes('--strict') || process.env.FOUNDRY_LIVE_REQUIRED === '1'
  try {
    await runFoundryLiveVerification({ strict })
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Foundry live verification FAILED')
    process.exitCode = 1
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()

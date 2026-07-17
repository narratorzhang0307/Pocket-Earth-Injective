import assert from 'node:assert/strict'
import { buildLlmRequest, getLlmProviders, publicProviderState } from '../frost-agent/provider-compat/runtime.mjs'
import { runFoundryLiveVerification } from './verify-foundry-live.mjs'

const env = {
  FROST_LLM_PROVIDER: 'auto',
  AZURE_OPENAI_ENDPOINT: 'https://pocket-earth.openai.azure.com/',
  AZURE_OPENAI_API_KEY: 'azure-secret',
  AZURE_OPENAI_DEPLOYMENT: 'model-router',
  AZURE_OPENAI_API_VERSION: '2024-10-21',
  DASHSCOPE_API_KEY: 'qwen-secret',
  QWEN_MODEL: 'qwen-plus',
}
const providers = getLlmProviders(env)
assert.deepEqual(providers.map((provider) => provider.name), ['azure-model-router', 'qwen'])

const messages = [{ role: 'user', content: 'hello' }]
const azure = buildLlmRequest(providers[0], { messages, json: true })
assert.equal(azure.url, 'https://pocket-earth.openai.azure.com/openai/deployments/model-router/chat/completions?api-version=2024-10-21')
assert.equal(azure.headers['api-key'], 'azure-secret')
assert.equal(azure.body.model, 'model-router')
assert.equal(azure.body.temperature, 0)
assert.deepEqual(azure.body.response_format, { type: 'json_object' })

const qwen = buildLlmRequest(providers[1], { messages, search: true })
assert.equal(qwen.url, 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions')
assert.equal(qwen.headers.authorization, 'Bearer qwen-secret')
assert.equal(qwen.body.enable_search, true)

const publicState = JSON.stringify(publicProviderState(providers))
assert.doesNotMatch(publicState, /azure-secret|qwen-secret/)
assert.match(publicState, /azure-model-router/)
assert.match(publicState, /fallback/)

assert.deepEqual(getLlmProviders({ FROST_LLM_PROVIDER: 'azure' }), [])
assert.deepEqual(getLlmProviders({ FROST_LLM_PROVIDER: 'qwen', DASHSCOPE_API_KEY: 'x' }).map((provider) => provider.name), ['qwen'])

const skipped = await runFoundryLiveVerification({ env: {}, log: () => {} })
assert.deepEqual(skipped, {
  ok: false,
  skipped: true,
  missing: ['AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_DEPLOYMENT'],
})
await assert.rejects(
  runFoundryLiveVerification({ env: {}, strict: true, log: () => {} }),
  /FAILED.*AZURE_OPENAI_ENDPOINT/,
)

let capturedRequest
const liveResult = await runFoundryLiveVerification({
  env,
  log: () => {},
  fetchImpl: async (url, init) => {
    capturedRequest = { url, init }
    return new Response(JSON.stringify({
      model: 'routed-model',
      choices: [{ message: { content: 'POCKET_EARTH_FOUNDRY_OK' } }],
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'request-id-fixture' },
    })
  },
})
assert.equal(liveResult.provider, 'azure-model-router')
assert.equal(liveResult.model, 'routed-model')
assert.equal(liveResult.requestId, 'request-id-fixture')
assert.equal(capturedRequest.url, azure.url)
assert.equal(capturedRequest.init.headers['api-key'], 'azure-secret')
assert.doesNotMatch(JSON.stringify(liveResult), /azure-secret|pocket-earth\.openai\.azure\.com/)

console.log('foundry provider verification passed')

import assert from 'node:assert/strict'
import { buildLlmRequest, getLlmProviders, publicProviderState } from '../frost-agent/provider-compat/runtime.mjs'

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

console.log('foundry provider verification passed')


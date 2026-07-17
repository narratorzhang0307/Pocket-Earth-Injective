// Shared server-side LLM provider runtime for both Vite dev and production.
// Secrets stay in process/env and are never included in public status objects.

function cleanBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '')
}

function azureRoot(value) {
  const base = cleanBaseUrl(value)
  const marker = base.indexOf('/openai/')
  return marker >= 0 ? base.slice(0, marker) : base
}

function dashscopeProvider(env) {
  const key = env.DASHSCOPE_API_KEY || env.QWEN_API_KEY || ''
  if (!key) return null
  return {
    name: 'qwen',
    key,
    model: env.QWEN_MODEL || 'qwen-plus',
    endpoint: cleanBaseUrl(env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
  }
}

function azureProvider(env) {
  const key = env.AZURE_OPENAI_API_KEY || env.AZURE_FOUNDRY_API_KEY || ''
  const endpoint = azureRoot(env.AZURE_OPENAI_ENDPOINT || env.AZURE_FOUNDRY_ENDPOINT || '')
  const deployment = String(env.AZURE_OPENAI_DEPLOYMENT || env.AZURE_FOUNDRY_DEPLOYMENT || '').trim()
  if (!key || !endpoint || !deployment) return null
  return {
    name: 'azure-model-router',
    key,
    model: deployment,
    endpoint,
    apiVersion: env.AZURE_OPENAI_API_VERSION || '2024-10-21',
  }
}

export function getLlmProviders(env = process.env) {
  const wanted = String(env.FROST_LLM_PROVIDER || 'auto').trim().toLowerCase()
  const azure = azureProvider(env)
  const qwen = dashscopeProvider(env)
  if (wanted === 'azure' || wanted === 'foundry' || wanted === 'model-router') return [azure, qwen].filter(Boolean)
  if (wanted === 'qwen' || wanted === 'dashscope') return [qwen].filter(Boolean)
  return [azure, qwen].filter(Boolean)
}

export function publicProviderState(providers = []) {
  return providers.map((provider, index) => ({
    name: provider.name,
    model: provider.model,
    role: index === 0 ? 'primary' : 'fallback',
  }))
}

export function buildLlmRequest(provider, input = {}) {
  const messages = Array.isArray(input.messages) ? input.messages : []
  const utility = !!input.json
  const body = {
    model: provider.model,
    messages,
    temperature: input.temperature ?? (utility ? 0 : 0.7),
    ...(input.json ? { response_format: { type: 'json_object' } } : {}),
    ...(input.stream ? { stream: true } : {}),
  }

  if (provider.name === 'azure-model-router') {
    const deployment = encodeURIComponent(provider.model)
    const apiVersion = encodeURIComponent(provider.apiVersion || '2024-10-21')
    return {
      url: `${provider.endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      headers: { 'content-type': 'application/json', 'api-key': provider.key },
      body,
    }
  }

  return {
    url: `${provider.endpoint}/chat/completions`,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${provider.key}` },
    body: {
      ...body,
      ...(input.search ? { enable_search: true } : {}),
    },
  }
}


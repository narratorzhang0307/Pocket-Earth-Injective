import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const files = {
  readme: await readFile(new URL('../deploy/online/injective/README.md', import.meta.url), 'utf8'),
  deploy: await readFile(new URL('../deploy/online/injective/deploy.sh', import.meta.url), 'utf8'),
  nginx: await readFile(new URL('../deploy/online/injective/nginx-pocket-earth-injective.conf', import.meta.url), 'utf8'),
  ecosystem: await readFile(new URL('../deploy/online/injective/ecosystem.config.cjs', import.meta.url), 'utf8'),
  runtimePackage: JSON.parse(await readFile(new URL('../deploy/online/injective/package.runtime.json', import.meta.url), 'utf8')),
  sdkRuntimePackage: JSON.parse(await readFile(new URL('../deploy/online/injective/sdk-package.runtime.json', import.meta.url), 'utf8')),
}

const domain = 'pocketearth-injective.throughtheglass.art'

assert.ok(files.readme.includes(domain))
assert.ok(files.deploy.includes(domain))
assert.ok(files.nginx.includes(`server_name ${domain}`))
assert.ok(files.deploy.includes('pocket-earth-injective'))
assert.ok(files.deploy.includes('API_PORT="${API_PORT:-3018}"'))
assert.ok(files.deploy.includes('test -f $APP_DIR/.env'))
assert.ok(files.deploy.includes('不得使用下划线'))
assert.ok(files.deploy.includes("--exclude='.env'"))
assert.ok(files.deploy.includes("--exclude='var/'"))
assert.ok(files.deploy.includes('--no-owner --no-group'))
assert.ok(files.deploy.includes('npm install --omit=dev --ignore-scripts'))
assert.ok(files.deploy.includes('pm2 startOrReload ecosystem.config.cjs'))
for (const required of ['injective-service.mjs', 'frost-feed-service.mjs', 'knowledge', 'chain-proof-data.mjs', 'public-earth-manifest.json', 'kernel.mjs']) {
  assert.ok(files.deploy.includes(required), `runtime package misses ${required}`)
}
assert.ok(files.ecosystem.includes("name: 'pocket-earth-injective'"))
assert.ok(files.ecosystem.includes("name: 'pocket-earth-injective-knowledge'"))
assert.ok(files.ecosystem.includes("API_PORT: '3018'"))
assert.ok(files.ecosystem.includes("KNOWLEDGE_TOPICS: 'ai,technology,finance,climate,science,health,culture,policy'"))
assert.equal(files.runtimePackage.dependencies['@injective/agent-sdk'], 'file:vendor/injective-agent-sdk')
assert.equal(files.runtimePackage.dependencies.bech32, '2.0.0')
assert.equal(files.runtimePackage.dependencies.viem, '~2.47.6')
assert.equal(files.sdkRuntimePackage.name, '@injective/agent-sdk')
assert.equal(files.sdkRuntimePackage.dependencies.bech32, '2.0.0')
assert.ok(!files.sdkRuntimePackage.devDependencies)
assert.ok(files.nginx.includes('proxy_pass http://127.0.0.1:3018'))
assert.ok(!files.deploy.includes('pm2 delete'))
assert.ok(!files.nginx.includes('pocketearth.throughtheglass.art'))
assert.ok(!files.nginx.includes('pocketearth_injective'))

console.log('OK Injective competition deployment lane is isolated and uses the live hyphenated HTTPS domain.')

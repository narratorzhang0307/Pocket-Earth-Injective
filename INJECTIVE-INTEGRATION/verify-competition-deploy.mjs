import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const files = {
  readme: await readFile(new URL('../deploy/online/injective/README.md', import.meta.url), 'utf8'),
  deploy: await readFile(new URL('../deploy/online/injective/deploy.sh', import.meta.url), 'utf8'),
  nginx: await readFile(new URL('../deploy/online/injective/nginx-pocket-earth-injective.conf', import.meta.url), 'utf8'),
}

const domain = 'pocketearth-injective.throughtheglass.art'

assert.ok(files.readme.includes(domain))
assert.ok(files.deploy.includes(domain))
assert.ok(files.nginx.includes(`server_name ${domain}`))
assert.ok(files.deploy.includes('pocket-earth-injective'))
assert.ok(files.deploy.includes('API_PORT="${API_PORT:-3018}"'))
assert.ok(files.deploy.includes('test -f $APP_DIR/.env'))
assert.ok(files.deploy.includes('不得使用下划线'))
assert.ok(files.nginx.includes('proxy_pass http://127.0.0.1:3018'))
assert.ok(!files.deploy.includes('pm2 delete'))
assert.ok(!files.nginx.includes('pocketearth.throughtheglass.art'))
assert.ok(!files.nginx.includes('pocketearth_injective'))

console.log('OK Injective competition deployment lane is isolated and waits for the hyphenated DNS name.')

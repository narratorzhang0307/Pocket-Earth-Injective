import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const paths = [
  '../index.html',
  '../public/manifest.webmanifest',
  '../src/app/components/MusicAgentsTab.tsx',
  '../src/app/components/PhotosTab.tsx',
  '../src/app/components/MyMapTab.tsx',
  '../src/app/components/PublicEarthPanel.tsx',
  '../src/app/lib/plaza/spaceAgent.ts',
  '../src/app/lib/plaza/catalog.ts',
]
const files = await Promise.all(paths.map((path) => readFile(new URL(path, import.meta.url), 'utf8')))
const joined = files.join('\n')

assert.ok(files[0].includes('Pocket Earth on Injective'))
assert.ok(files[1].includes('Pocket Earth on Injective'))
assert.equal((joined.match(/POCKET EARTH ON INJECTIVE/g) || []).length, 3)
assert.ok(joined.includes('PUBLIC EARTH · INJECTIVE'))
assert.ok(joined.includes('四要素'))

for (const forbidden of ['¥9/月', '5 INJ', 'pricing:', 'type Pricing', '未来是否需要支付']) {
  assert.ok(!joined.includes(forbidden), `competition UI must omit ${forbidden}`)
}

console.log('OK competition branding is visible and Agent Plaza carries no economic UI model.')

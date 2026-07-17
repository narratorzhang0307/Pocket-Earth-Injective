import { readFileSync } from 'node:fs'
import { keccak256, stringToHex } from 'viem'

export const PUBLIC_EARTH_MANIFEST = JSON.parse(readFileSync(new URL('./public-earth-manifest.json', import.meta.url), 'utf8'))
export const PUBLIC_EARTH_DEPLOYMENT = JSON.parse(readFileSync(new URL('./public-earth-deployment.json', import.meta.url), 'utf8'))

export function buildPublicEarthCard(residence) {
  return {
    schema: PUBLIC_EARTH_MANIFEST.schema,
    agentId: residence.agentId,
    displayName: residence.displayName,
    zone: residence.zone,
    doorplate: residence.doorplate,
    publicTraits: residence.publicTraits,
    cardVersion: residence.cardVersion,
  }
}

export function publicEarthCardHash(residence) {
  return keccak256(stringToHex(JSON.stringify(buildPublicEarthCard(residence))))
}

export function publicEarthResidences() {
  return PUBLIC_EARTH_MANIFEST.residences.map((residence) => ({
    ...residence,
    zoneInfo: PUBLIC_EARTH_MANIFEST.zones.find((zone) => zone.id === residence.zone),
    cardHash: publicEarthCardHash(residence),
  }))
}

# Judge Quickstart · Pocket Earth on Injective

> One-page review path. Everything here is public, read-only, and testnet-scoped; no secrets or raw Pocket Earth profile data are needed.

## 60-Second Path

1. Open Frost main identity `agentId 43`: https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43
2. Open the owner wallet timeline: https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934
3. Read the public evidence API: `/api/injective?tool=get-chain-evidence`, especially `judgeRunbook`, `publicReadApis[].judgeFocus`, `publicReadApis[].expectedFields`, `hardwareBridge`, `reviewEntrypoints.hardware-bridge-api`, `reviewEntrypoints.hardware-bridge`, `deliveryChecklist.frost-edge-node`, `agents[].proofApi`, `registryMintEvents`, `registryMintSummary`, the wallet `timeline` `from` / `expectedStatus` fields, `timelineSummary`, `handshakeProof`, `recordingOrder[].evidenceFocus`, and the `registry-mint-events` checklist item
4. Open the single-agent proof card: `/api/injective?tool=get-agent-proof&agentId=43`
5. Read the builder-scoped fleet: `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47`. Start from the top-level `sdk`, `total`, `offset`, `limit`; then inspect each `agents[]` row for `owner`, `wallet`, `identityTuple`, `builderCode`. For `agentId 44-47`, the attached public data URI card fields should include `card.tags` and `card.metadata.builderCode`, without raw private profile text.
6. Read the RPC-backed wallet timeline: `/api/injective?tool=get-wallet-timeline`, starting from its `summary` and `chainId 1439`
7. Open the Frost Edge Node proof card: `/api/injective?tool=get-hardware-bridge-proof`, starting from `hardwareBridge.chainDispatch`, `piRouter.skills`, `hardwareBridge.marketBoundary`, and `privacyBoundary.hardware`
8. Check the API `sourceControl` field: it should point to the public GitHub repo, `main`, and the current commit URL.
9. Check the ERC-8004 mint events locally: `npm run verify:registry`
10. Run the local smoke: `npm run verify:judge && npm run verify:wallet && npm run verify:public-apis && npm run verify:integration-guide && npm run verify:positioning && npm run verify:source && npm run verify:registry && npm run verify:agent-proof && npm run verify:hardware && npm run verify:demo`

## What This Proves

- `agentId 43-47` are Pocket Earth Frost identities on Injective testnet with `builderCode = pocket-earth`.
- `judgeRunbook` embeds the same 60-second path in the product API: identity page, owner wallet, evidence API, public read API suite, and `npm run verify:demo`.
- Each `agents[]` row in the public evidence API now includes a `proofApi`; `npm run verify:agent-proof` opens those single-agent cards for `agentId 43-47`.
- The builder-scoped fleet API proves the same identities can be read back by `builderCode=pocket-earth`: top-level `sdk`, `total`, `offset`, `limit` confirm the query shape; `agents[]` exposes `owner`, `wallet`, `identityTuple`, `builderCode`; `agentId 44-47` expose only `card.tags` and `card.metadata.builderCode` as public data URI card fields.
- The same `agentId 43-47` identities are backed by ERC-8004 Registry `Transfer(0x0 -> owner, tokenId)` mint events, and `registryMintSummary` condenses the agentId range, same-owner check, zero-address mint check, first/last block, and `npm run verify:registry` command.
- ERC-8004 `agentId 43` belongs to wallet `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`.
- The public evidence `timeline` shows the same wallet as transaction `from` and `expectedStatus: success`; `timelineSummary` condenses the owner, event count, first/last blocks, first/last timestamps, and RPC verification path before the wallet timeline rechecks receipts and blocks. The wallet timeline also returns `chainId 1439` plus its own `summary` so reviewers can confirm the Injective testnet, event count, all-succeeded status, and first/last block/time before reading every event row.
- `handshakeProof` summarizes the real `agentId 43 <-> 44` SocialHandshake transaction with score `88`, contract/transaction Blockscout links, timestamp, block number, public commitment policy, and the local verifier command.
- `recordingOrder[].evidenceFocus` names the exact proof to look for at each recording step: owner, single-agent proof/source anchor, `builderCode=pocket-earth`, Registry mint summary, wallet timeline, a standalone Frost Edge Node hardware proof API, and then the public-plaza / agent-plaza smoke.
- `SocialHandshake` records a real `agentId 43 <-> 44` handshake with score `88` and public commitments.
- `public-plaza` is the chain social discovery loop; `agent-plaza` is the marketplace/install loop.
- Agent Plaza is the commercial path boundary: developers publish `manifest / schema / permissions`, Pocket Earth runs `reviewManifest` and `toManifest`, users install with `INSTALL -> My Agents -> RUN`, and future install / call / review / optional paid receipts can flow back into Profile Confidence. This keeps `public-plaza` as chain discovery, `agent-plaza` as installable agent market, and Frost Edge Node as a developer-kit / experience layer rather than the revenue pillar.
- `reviewEntrypoints.hardware-bridge-api` opens `/api/injective?tool=get-hardware-bridge-proof`, `reviewEntrypoints.hardware-bridge` points to `hardware/frost-buddy/`, and `deliveryChecklist.frost-edge-node` keeps the Raspberry Pi / BLE / TTS bridge reviewable as a privacy-bounded prototype. `hardwareBridge.marketBoundary` keeps Frost Edge Node framed as a prototype and developer-kit endpoint rather than a hardware revenue projection. `npm run verify:hardware` checks `music_now_playing`, Injective `chain_dispatch`, the Pi skill router, and the no-private-key/no-raw-profile boundary.
- `npm run verify:integration-guide` checks that the integration guide's API table, runbook order, npm script mappings, and README first-minute evidence guide still match the product API.
- `npm run verify:positioning` checks that README, integration docs, key service code, app source, hardware bridge, docs, and frost-agent files keep the Injective core-integration framing.
- The evidence API is `readOnly` and `publicOnly`; its `publicReadApis` manifest lists the five judge-safe GET endpoints (`get-chain-evidence`, `get-agent-proof`, `list-agents`, `get-wallet-timeline`, `get-hardware-bridge-proof`) with `chainId 1439`, matching public-only flags, `judgeFocus`, `expectedFields`, and local verification commands. `npm run verify:public-apis` opens all five endpoints through the product API and checks the manifest, source anchor, single-agent proof card, fleet, wallet timeline, hardware bridge proof, reviewer guidance, and public-only leak guard. Raw books, films, music, photos, moods, precise locations, and secret keys stay off-chain.

## Agent Plaza Commercial Path Fast Check

| Question | What to inspect | Expected answer |
|---|---|---|
| Is social discovery separated from the market? | `public-plaza` and `agent-plaza` in the app, plus `plazaFlow` in `/api/injective?tool=get-chain-evidence` | `public-plaza` reads chain identities and SocialHandshake context; `agent-plaza` handles manifest review, installation, and My Agents return path |
| Is the install loop real enough to show? | `manifest / schema / permissions`, `reviewManifest`, `toManifest`, `INSTALL -> My Agents -> RUN` | A free example agent can be reviewed, installed, shown in My Agents, and run; without key-backed confirmation it stays a `willEmit` dry-run |
| Why does Injective matter here? | `agentId 43-47`, wallet timeline, SocialHandshake, future Profile Checkpoint path | Developer, agent, install, handshake, review, and optional paid receipts need public identity and ordered receipts |
| What is the market boundary? | `hardwareBridge.marketBoundary`, `get-hardware-bridge-proof`, `PITCH-NOTES.md` | Business center is Agent Plaza; Frost Edge Node is Raspberry Pi / BLE / TTS developer kit and physical experience, not the current revenue pillar |

## Agent Plaza Receipt Loop Fast Check

Use this table when reviewing the business loop from PPT pages 30-32. The repository does not claim paid revenue is already settled; it shows the public receipt slots that make a future Agent Plaza market auditable.

| Receipt slot | Current proof to inspect | Future public receipt |
|---|---|---|
| Developer publish | `manifest / schema / permissions`, `reviewManifest`, `toManifest`, DANGER scan | `manifestReceipt(agentId, manifestHash, publisher, timestamp)` proves a reviewed manifest version |
| User install | `INSTALL -> My Agents -> RUN`, `plazaFlow`, `recordingOrder[].evidenceFocus` | `installReceipt(agentId, manifestHash, userConsentHash, timestamp)` proves consent to a public manifest |
| Agent call | `willEmit` dry-run, `RunTrace`, `reviewChecklist` | `callReceipt(agentId, runId, capability, resultHash, timestamp)` proves a capability ran without exposing raw input |
| User review | Profile Confidence L4, SocialHandshake, wallet timeline | `reviewReceipt(agentId, ratingBucket, reasonHash, timestamp)` proves a bucketed review without publishing long-form text |
| Optional payment | Future subscription / one-time call / platform fee path | `paymentReceipt(agentId, planOrCallId, settlementRef, timestamp)` stays separate from identity, install, and call receipts |

The order matters: first validate the manifest, then prove the install, then prove the call, then attach a review, and only then add an optional payment receipt. This keeps Agent Plaza as the business loop while Injective stays the public identity, version, and receipt layer.

## Pocket Earth Roadmap And Safety Boundary Fast Check

This path connects the product roadmap to the on-chain roadmap without changing the privacy model:

| Roadmap layer | Current proof | Next boundary |
|---|---|---|
| P0 core | Long-term profile, agent registry, and fingerprint cache make Pocket Earth more useful over time | Local profile stays local; public proof starts from derived cards, not raw memories |
| P1 compatibility | Provider compatibility, edge-side pre-classification, capability contracts, and health tracking make the local/cloud brain observable | Model providers can be swapped without changing the chain identity surface |
| P2 self-learning | Heartbeat suggestion engine, learning skills with safety gates, and real SSE streaming are in progress | Active behavior only suggests; declarative skill routes do not execute arbitrary code |
| NOW chain identity and handshake | ERC-8004 `agentId 43-47`, Blockscout proof, wallet timeline, and SocialHandshake are already public | Testnet writes are scoped to identity, mints, and handshake receipts |
| P1 Profile Checkpoint | Future profileHash + version + timestamp checkpoint signed by Frost | Raw memories never go on-chain |
| P2 Agent Plaza receipts | Future install / call / review / optional paid receipts from Agent Plaza | `reviewManifest` and `toManifest` keep permissions inspectable before receipts exist |
| P3 Profile Confidence | Time continuity, source weighting, selective proof, and social corroboration | Bulk imports and suspicious jumps can be down-weighted instead of trusted blindly |
| P4 Frost Network | Frost Edge Node, podcast summaries, chain dispatch narration, and agent-to-agent service calls | Hardware remains a developer-kit / experience layer until the software market loop is proven |

One rule carries through every layer: only identity, versions, receipts, and selective proofs go on-chain; books, films, music, photos, moods, precise locations, and private profile text do not.

## Review Package

- GitHub repository: https://github.com/narratorzhang0307/Pocket-Earth-Injective
- Live demo: https://pocketearth.throughtheglass.art/?demo
- Demo limit: `180s`, guarded by `npm run verify:duration`
- Source-control guard: `npm run verify:source`
- Registry mint-event guard: `npm run verify:registry`
- Single-agent proof guard: `npm run verify:agent-proof`
- Frost Edge Node hardware guard: `npm run verify:hardware`
- Integration-guide guard: `npm run verify:integration-guide`
- Positioning guard: `npm run verify:positioning`
- Pitch notes guard: `npm run verify:pitch`
- Judge quickstart guard: `npm run verify:judge`

## Public Links

| Evidence | Link |
|---|---|
| Frost main identity #43 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43 |
| Owner wallet | https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934 |
| ERC-8004 IdentityRegistry | https://testnet.blockscout.injective.network/address/0x8004A818BFB912233c491871b3d84c89A494BD9e |
| SocialHandshake contract | https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee |
| Frost registration tx | https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554 |
| SocialHandshake deploy tx | https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722 |
| Real handshake tx | https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6 |
| Frost Edge Node hardware bridge | https://github.com/narratorzhang0307/Pocket-Earth-Injective/tree/main/hardware/frost-buddy |

## Local Commands

```bash
npm run verify:github
npm run verify:duration
npm run verify:judge
npm run verify:demo
npm run verify:wallet
npm run verify:public-apis
npm run verify:integration-guide
npm run verify:positioning
npm run verify:source
npm run verify:registry
npm run verify:agent-proof
npm run verify:hardware
npm run verify:recording-order
npm run verify:injective
npm run verify:plaza
npm run verify:pitch
```

## Demo Reading Order

Use this order in the recording or in a live judge walkthrough: `agentId 43` page -> owner wallet -> public evidence API -> single-agent proof API -> builderCode fleet API -> wallet timeline API -> Frost Edge Node hardware proof API -> `public-plaza` chain discovery -> `agent-plaza` install loop.

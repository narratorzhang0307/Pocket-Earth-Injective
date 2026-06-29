# Judge Quickstart · Pocket Earth on Injective

> One-page review path. Everything here is public, read-only, and testnet-scoped; no secrets or raw Pocket Earth profile data are needed.

## 60-Second Path

1. Open Frost main identity `agentId 43`: https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43
2. Open the owner wallet timeline: https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934
3. Read the public evidence API: `/api/injective?tool=get-chain-evidence`, especially `judgeRunbook`, `publicReadApis[].judgeFocus`, `publicReadApis[].expectedFields`, `hardwareBridge`, `reviewEntrypoints.hardware-bridge`, `deliveryChecklist.frost-edge-node`, `agents[].proofApi`, `registryMintEvents`, `registryMintSummary`, the wallet `timeline` `from` / `expectedStatus` fields, `timelineSummary`, `handshakeProof`, `recordingOrder[].evidenceFocus`, and the `registry-mint-events` checklist item
4. Open the single-agent proof card: `/api/injective?tool=get-agent-proof&agentId=43`
5. Read the builder-scoped fleet: `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47`
6. Read the RPC-backed wallet timeline: `/api/injective?tool=get-wallet-timeline`, starting from its `summary` and `chainId 1439`
7. Check the API `sourceControl` field: it should point to the public GitHub repo, `main`, and the current commit URL.
8. Check the ERC-8004 mint events locally: `npm run verify:registry`
9. Run the local smoke: `npm run verify:judge && npm run verify:wallet && npm run verify:public-apis && npm run verify:integration-guide && npm run verify:positioning && npm run verify:source && npm run verify:registry && npm run verify:agent-proof && npm run verify:hardware && npm run verify:demo`

## What This Proves

- `agentId 43-47` are Pocket Earth Frost identities on Injective testnet with `builderCode = pocket-earth`.
- `judgeRunbook` embeds the same 60-second path in the product API: identity page, owner wallet, evidence API, public read API suite, and `npm run verify:demo`.
- Each `agents[]` row in the public evidence API now includes a `proofApi`; `npm run verify:agent-proof` opens those single-agent cards for `agentId 43-47`.
- The same `agentId 43-47` identities are backed by ERC-8004 Registry `Transfer(0x0 -> owner, tokenId)` mint events, and `registryMintSummary` condenses the agentId range, same-owner check, zero-address mint check, first/last block, and `npm run verify:registry` command.
- ERC-8004 `agentId 43` belongs to wallet `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`.
- The public evidence `timeline` shows the same wallet as transaction `from` and `expectedStatus: success`; `timelineSummary` condenses the owner, event count, first/last blocks, first/last timestamps, and RPC verification path before the wallet timeline rechecks receipts and blocks. The wallet timeline also returns `chainId 1439` plus its own `summary` so reviewers can confirm the Injective testnet, event count, all-succeeded status, and first/last block/time before reading every event row.
- `handshakeProof` summarizes the real `agentId 43 <-> 44` SocialHandshake transaction with score `88`, contract/transaction Blockscout links, timestamp, block number, public commitment policy, and the local verifier command.
- `recordingOrder[].evidenceFocus` names the exact proof to look for at each recording step: owner, single-agent proof/source anchor, `builderCode=pocket-earth`, Registry mint summary, wallet timeline, plaza grouping, and Frost Edge Node `chain_dispatch` public-event handoff.
- `SocialHandshake` records a real `agentId 43 <-> 44` handshake with score `88` and public commitments.
- `public-plaza` is the chain social discovery loop; `agent-plaza` is the marketplace/install loop.
- `reviewEntrypoints.hardware-bridge` points to `hardware/frost-buddy/`, and `deliveryChecklist.frost-edge-node` keeps the Raspberry Pi / BLE / TTS bridge reviewable as a privacy-bounded prototype. `npm run verify:hardware` checks `music_now_playing`, Injective `chain_dispatch`, the Pi skill router, and the no-private-key/no-raw-profile boundary.
- `npm run verify:integration-guide` checks that the integration guide's API table, runbook order, npm script mappings, and README first-minute evidence guide still match the product API.
- `npm run verify:positioning` checks that README, integration docs, key service code, app source, hardware bridge, docs, and frost-agent files keep the Injective core-integration framing.
- The evidence API is `readOnly` and `publicOnly`; its `publicReadApis` manifest lists the four judge-safe GET endpoints (`get-chain-evidence`, `get-agent-proof`, `list-agents`, `get-wallet-timeline`) with `chainId 1439`, matching public-only flags, `judgeFocus`, `expectedFields`, and local verification commands. `npm run verify:public-apis` opens all four endpoints through the product API and checks the manifest, source anchor, single-agent proof card, fleet, wallet timeline, reviewer guidance, and public-only leak guard. Raw books, films, music, photos, moods, precise locations, and secret keys stay off-chain.

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

Use this order in the recording or in a live judge walkthrough: `agentId 43` page -> owner wallet -> public evidence API -> single-agent proof API -> builderCode fleet API -> wallet timeline API -> `public-plaza` chain discovery -> `agent-plaza` install loop.

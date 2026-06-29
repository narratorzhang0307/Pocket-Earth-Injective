# Judge Quickstart · Pocket Earth on Injective

> One-page review path. Everything here is public, read-only, and testnet-scoped; no secrets or raw Pocket Earth profile data are needed.

## 60-Second Path

1. Open Frost main identity `agentId 43`: https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43
2. Open the owner wallet timeline: https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934
3. Read the public evidence API: `/api/injective?tool=get-chain-evidence`, especially `publicReadApis`, `registryMintEvents`, `registryMintSummary`, the wallet `timeline` `from` / `expectedStatus` fields, `timelineSummary`, `recordingOrder[].evidenceFocus`, and the `registry-mint-events` checklist item
4. Read the builder-scoped fleet: `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47`
5. Read the RPC-backed wallet timeline: `/api/injective?tool=get-wallet-timeline`, starting from its `summary` and `chainId 1439`
6. Check the API `sourceControl` field: it should point to the public GitHub repo, `main`, and the current commit URL.
7. Check the ERC-8004 mint events locally: `npm run verify:registry`
8. Run the local smoke: `npm run verify:judge && npm run verify:wallet && npm run verify:public-apis && npm run verify:source && npm run verify:registry && npm run verify:demo`

## What This Proves

- `agentId 43-47` are Pocket Earth Frost identities on Injective testnet with `builderCode = pocket-earth`.
- The same `agentId 43-47` identities are backed by ERC-8004 Registry `Transfer(0x0 -> owner, tokenId)` mint events, and `registryMintSummary` condenses the agentId range, same-owner check, zero-address mint check, first/last block, and `npm run verify:registry` command.
- ERC-8004 `agentId 43` belongs to wallet `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`.
- The public evidence `timeline` shows the same wallet as transaction `from` and `expectedStatus: success`; `timelineSummary` condenses the owner, event count, first/last blocks, first/last timestamps, and RPC verification path before the wallet timeline rechecks receipts and blocks. The wallet timeline also returns `chainId 1439` plus its own `summary` so reviewers can confirm the Injective testnet, event count, all-succeeded status, and first/last block/time before reading every event row.
- `recordingOrder[].evidenceFocus` names the exact proof to look for at each recording step: owner, `builderCode=pocket-earth`, Registry mint summary, wallet timeline, and plaza grouping.
- `SocialHandshake` records a real `agentId 43 <-> 44` handshake with score `88` and public commitments.
- `public-plaza` is the chain social discovery loop; `agent-plaza` is the marketplace/install loop.
- The evidence API is `readOnly` and `publicOnly`; its `publicReadApis` manifest lists the three judge-safe GET endpoints (`get-chain-evidence`, `list-agents`, `get-wallet-timeline`) with `chainId 1439`, matching public-only flags, and local verification commands. `npm run verify:public-apis` opens all three endpoints through the product API and checks the manifest, source anchor, fleet, wallet timeline, and public-only leak guard. Raw books, films, music, photos, moods, precise locations, and secret keys stay off-chain.

## Submission Package

- GitHub repository: https://github.com/narratorzhang0307/Pocket-Earth-Injective
- Live demo: https://pocketearth.throughtheglass.art/?demo
- Demo limit: `180s`, guarded by `npm run verify:duration`
- Source-control guard: `npm run verify:source`
- Registry mint-event guard: `npm run verify:registry`
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

## Local Commands

```bash
npm run verify:github
npm run verify:duration
npm run verify:judge
npm run verify:demo
npm run verify:wallet
npm run verify:public-apis
npm run verify:source
npm run verify:registry
npm run verify:recording-order
npm run verify:injective
npm run verify:plaza
npm run verify:pitch
```

## Demo Reading Order

Use this order in the recording or in a live judge walkthrough: `agentId 43` page -> owner wallet -> public evidence API -> builderCode fleet API -> wallet timeline API -> `public-plaza` chain discovery -> `agent-plaza` install loop.

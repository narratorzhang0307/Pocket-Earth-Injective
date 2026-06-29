# Judge Quickstart · Pocket Earth on Injective

> One-page review path. Everything here is public, read-only, and testnet-scoped; no secrets or raw Pocket Earth profile data are needed.

## 60-Second Path

1. Open Frost main identity `agentId 43`: https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43
2. Open the owner wallet timeline: https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934
3. Read the public evidence API: `/api/injective?tool=get-chain-evidence`
4. Read the builder-scoped fleet: `/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47`
5. Read the RPC-backed wallet timeline: `/api/injective?tool=get-wallet-timeline`
6. Run the local smoke: `npm run verify:judge && npm run verify:demo`

## What This Proves

- `agentId 43-47` are Pocket Earth Frost identities on Injective testnet with `builderCode = pocket-earth`.
- ERC-8004 `agentId 43` belongs to wallet `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`.
- `SocialHandshake` records a real `agentId 43 <-> 44` handshake with score `88` and public commitments.
- `public-plaza` is the chain social discovery loop; `agent-plaza` is the marketplace/install loop.
- The evidence API is `readOnly` and `publicOnly`; raw books, films, music, photos, moods, precise locations, and secret keys stay off-chain.

## Submission Package

- GitHub repository: https://github.com/narratorzhang0307/Pocket-Earth-Injective
- Live demo: https://pocketearth.throughtheglass.art/?demo
- Demo limit: `180s`, guarded by `npm run verify:duration`
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
npm run verify:injective
npm run verify:plaza
npm run verify:pitch
```

## Demo Reading Order

Use this order in the recording or in a live judge walkthrough: `agentId 43` page -> owner wallet -> public evidence API -> builderCode fleet API -> wallet timeline API -> `public-plaza` chain discovery -> `agent-plaza` install loop.

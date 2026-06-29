# Chain Evidence · Pocket Earth on Injective

> 评审复验入口：本页只列公开链上证据。所有链接指向 Injective testnet Blockscout；私人画像原文、书影音原文、精确坐标和私钥不在本页、也不在链上。

## 一眼结论

- Network: Injective testnet, chainId `1439`
- IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Builder code: `pocket-earth`
- Owner / wallet: `0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934`
- Main Frost identity: `agentId 43`
- Fleet identities: `agentId 43-47`
- SocialHandshake: `0xe5338a162a44a685201e1f6120b1a851949e3aee`

## Reviewer Checklist

For a 60-second review path, open `JUDGE-QUICKSTART.md` first. `/api/injective?tool=get-chain-evidence` also returns `registryMintEvents`, a public event-level table for `agentId 43-47` with mint-from, owner, tx hash, block number, tx link, and agent identity link. The same evidence package now exposes a wallet `timeline` where every key transaction carries `from: 0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934` and `expectedStatus: success`, plus a `timelineSummary` that summarizes the owner, event count, first/last block, first/last timestamp, and RPC verification path. Reviewers can see the same-wallet success sequence before opening the RPC-backed timeline. It then returns `reviewBrief`: a judge-facing summary with one line, four Injective proof cards, three contest-fit mappings, and a four-step review path. `reviewChecklist` expands that into what each public proof is meant to verify, including a dedicated `registry-mint-events` checkpoint for ERC-8004 mint provenance. It also includes `competitionAlignment`, which maps the same public proofs to AI social agents, Injective execution, the physical Frost Buddy extension, and the privacy-first evidence boundary. `submissionLinks` keeps the final review entry points together: the GitHub repo, live `?demo` URL, public evidence API, fleet API, and wallet timeline API. `submissionChecklist` maps the contest submission requirements back to public proof: public GitHub + README, Injective integration, sub-3-minute demo script, pitch-deck notes, and read-only review APIs. `sourceControl` ties the public evidence API to the GitHub repository, `main` branch, current commit SHA, and commit URL. `npm run verify:github` confirms the public GitHub repository, `origin/main`, and remote README/evidence files are the Injective submission; `npm run verify:source` confirms the evidence API source-control anchor matches the current checkout; `npm run verify:registry` reads the ERC-8004 Registry mint events for `agentId 43-47`; `npm run verify:pitch` checks the pitch notes, hardware boundary, and cited Raspberry Pi source; `npm run verify:judge` checks the one-page judge path; `npm run verify:public-proof` treats the JSON as the judge-facing contract and guards its field shape, source anchor, commands, public URLs, repo boundary, and secret/local-path leak surface.

| Check | Public evidence | Pass criteria |
|---|---|---|
| ERC-8004 identity ownership | Frost main identity #43 | #43 belongs to `0x6D5A...C934`, uses `builderCode = pocket-earth`, and points to the Injective IdentityRegistry |
| Pocket Earth agent fleet | `list-agents&builderCode=pocket-earth` | `agentId 43-47` are read back from Injective testnet and #44-47 expose only public data URI card fields |
| Wallet evidence chain | Owner wallet + RPC timeline API | registration, SocialHandshake deployment, fleet registration, and the real handshake are sent by the same wallet in block order |
| Real SocialHandshake proof | Contract + real handshake tx | call/event decode to `agentA 43`, `agentB 44`, `score 88`, with two non-zero Taste Passport commitments |
| Public-only privacy boundary | Public evidence API | evidence is marked `readOnly` / `publicOnly`; raw books, films, music, photos, moods, precise locations, and private keys stay off-chain |
| Product demo loop | Plaza UI smoke | `public-plaza` reads Injective agents and pins them to the globe; `agent-plaza` keeps the install loop demonstrable |

## IdentityRegistry

| Evidence | Link |
|---|---|
| IdentityRegistry contract | https://testnet.blockscout.injective.network/address/0x8004A818BFB912233c491871b3d84c89A494BD9e |
| Frost main identity #43 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43 |
| Agent #44 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/44 |
| Agent #45 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/45 |
| Agent #46 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/46 |
| Agent #47 | https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/47 |

## Registration Transactions

| agentId | Public role | Transaction |
|---|---|---|
| 43 | Frost main identity | https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554 |
| 44 | FROST·拉美文学旅人 | https://testnet.blockscout.injective.network/tx/0x02a0590c2f1bc1e475d7cdfb2fa4c3eb5e0b9f7de4ac1f97e66663e0f5a38f44 |
| 45 | FROST·黑色电影迷 | https://testnet.blockscout.injective.network/tx/0xc161f0df707b1c9b1e29311e944b7c1b40f3d525c9d1cbd2d71c67713333fffe |
| 46 | FROST·爵士夜行者 | https://testnet.blockscout.injective.network/tx/0x1bbd3df139b2558ff315d2029f00c01dc881a45542d5854176bbc49e6dfaea4e |
| 47 | FROST·北欧极光客 | https://testnet.blockscout.injective.network/tx/0xada3e082b8e8988e414bcf201739f2a2a3b5fe9c947db71ebe1e7467f3de1a50 |

## Wallet And Handshake

| Evidence | Link |
|---|---|
| Wallet evidence chain | https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934 |
| SocialHandshake contract | https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee |
| SocialHandshake deployment tx | https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722 |
| Real handshake tx | https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6 |

## RPC Timeline

`verify-chain-timeline.mjs` reads these transaction receipts and blocks from Injective testnet JSON-RPC, so the wallet-page story is not only a set of screenshots:

| Step | Block | UTC time | Transaction |
|---|---:|---|---|
| Frost main identity #43 registration | `131678496` | `2026-06-27T01:46:30.000Z` | `0xd2b574...0554` |
| SocialHandshake deployment | `131678987` | `2026-06-27T01:53:16.000Z` | `0x604842...a722` |
| Agent #44 registration | `131679781` | `2026-06-27T02:04:14.000Z` | `0x02a059...8f44` |
| Agent #45 registration | `131679930` | `2026-06-27T02:06:17.000Z` | `0xc161f0...fffe` |
| Agent #46 registration | `131679941` | `2026-06-27T02:06:26.000Z` | `0x1bbd3d...a4e` |
| Agent #47 registration | `131679948` | `2026-06-27T02:06:32.000Z` | `0xada3e0...1a50` |
| Real SocialHandshake 43 <-> 44 | `131869118` | `2026-06-28T21:34:21.000Z` | `0x0e597f...f2d6` |

## Product API Checks

Reviewers can also verify the same chain facts through Pocket Earth itself. These are read-only API calls; they do not need a private key and do not create transactions:

```bash
curl 'http://localhost:5173/api/injective?tool=get-chain-evidence'
curl 'http://localhost:5173/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47'
curl 'http://localhost:5173/api/injective?tool=get-wallet-timeline'
npm run verify:demo
npm run verify:duration
npm run verify:evidence
npm run verify:public-proof
npm run verify:github
npm run verify:pitch
npm run verify:judge
npm run verify:brief
npm run verify:review
npm run verify:review-links
npm run verify:recording-order
npm run verify:wallet
npm run verify:source
npm run verify:registry
npm run verify:plaza-flow
npm run verify:nova-alignment
npm run verify:submission
node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs
```

The first call returns the public evidence package from the same `chain-proof-data.mjs` facts used by the verification suite. It is explicitly marked `network: testnet`, `chainId: 1439`, `readOnly: true`, and `publicOnly: true`, and includes the follow-up verification commands/paths (`npm run verify:demo`, `npm run verify:duration`, `npm run verify:evidence`, `npm run verify:public-proof`, `npm run verify:github`, `npm run verify:source`, `npm run verify:registry`, `npm run verify:pitch`, `npm run verify:judge`, `npm run verify:brief`, `npm run verify:review`, `npm run verify:review-links`, `npm run verify:recording-order`, `npm run verify:wallet`, `npm run verify:plaza-flow`, `npm run verify:nova-alignment`, `npm run verify:submission`, `npm run verify:injective`, `list-agents`, and `get-wallet-timeline`) plus `registryMintEvents` for ERC-8004 mint event rows, `timeline` rows with the shared owner wallet in `from` and `expectedStatus: success`, `timelineSummary` for the owner/event-count/first-block/last-block/RPC-verification summary, `reviewBrief` for the one-page judge summary, `reviewLinks` for the most important Blockscout pages, `reviewChecklist` for what each proof should establish, `competitionAlignment` for mapping the public proof to the Injective Nova story, `submissionLinks` for the final review entry points, `submissionChecklist` for mapping the contest's GitHub/README, Injective integration, demo video, pitch deck, and public API requirements to current proof, `sourceControl` for the current repository/branch/commit URL, a `recordingOrder` array for the recommended demo sequence, a `privacyBoundary` manifest that spells out what is on-chain versus kept off-chain, and a `plazaFlow` manifest that separates `public-plaza` chain discovery from the `agent-plaza` install loop. The plaza flow maps to `verify-plaza.mjs`, `verify-space-plaza.mjs`, and `verify-plaza-install.mjs`. The second call reads `agentId 43-47` by `builderCode = pocket-earth`. The third call returns the RPC-backed wallet timeline above, including registration, SocialHandshake deployment, fleet registration, and the real `agentId 43 <-> 44` handshake. `npm run verify:duration` parses the demo script and keeps it within the 180-second submission limit; `npm run verify:judge` checks that `JUDGE-QUICKSTART.md` remains a public 60-second path through Blockscout, product APIs, and local commands; `npm run verify:wallet` checks the wallet timeline API as a focused proof of registration, deployment, fleet, and handshake transactions; `npm run verify:source` checks that the evidence API `sourceControl` field points to this repository, `main`, and the current commit; `npm run verify:registry` reads the ERC-8004 Registry `Transfer(0x0 -> owner, tokenId)` mint events for `agentId 43-47` and checks their registration transactions; `npm run verify:demo` is the pre-recording check for evidence API, public evidence contract, GitHub repo boundary, source-control anchor, pitch notes, judge quickstart, review brief, fleet readback, registry mint events, Blockscout links, recording order, plaza-flow grouping, competition alignment, submission links, and submission checklist; `npm run verify:evidence` is the fastest local smoke check for the JSON-only evidence package; `npm run verify:public-proof` checks that the judge-facing package keeps a stable field shape, registry mint rows, source-control anchor, only public review URLs, runnable verification commands, the Injective repo boundary, and no private env/local path/hash parameter leaks; `npm run verify:github` checks that `origin/main`, GitHub visibility, default branch, remote README, integration guide, evidence pack, and demo script still belong to the public `Pocket-Earth-Injective` submission; `npm run verify:pitch` checks that `PITCH-NOTES.md` keeps the deck story centered on Injective proof, carefully bounds Frost Buddy hardware claims, and cites the Raspberry Pi source; `npm run verify:brief` checks that the judge-facing `reviewBrief` still explains the Injective proof path, contest fit, and privacy line without local paths or secrets; `npm run verify:review` checks that the reviewer checklist still points at existing public links and local proof commands; `npm run verify:review-links` checks that the API-returned reviewer links are still complete, public-only, and reachable on Injective Blockscout; `npm run verify:recording-order` checks the exact recording order from Blockscout pages through product API calls to the plaza smoke; `npm run verify:plaza-flow` checks that `public-plaza` remains the chain-discovery flow and `agent-plaza` remains the marketplace/install flow; `npm run verify:nova-alignment` checks that the evidence package still maps Pocket Earth to AI social agents, Injective execution, the physical hardware extension, and privacy-first public proof without leaking local paths or secrets; `npm run verify:submission` checks that the final GitHub, live demo, API entry points, and submission checklist still point to this Injective submission.

Handshake calldata and event both decode to:

- `agentA`: `43`
- `agentB`: `44`
- `score`: `88`
- `profileHashA`: `0x7e8a254adf8ec98cacbf4f998433553532045748f6973d1be1e7a94d06165fb9`
- `profileHashB`: `0x34ec93bc1f4a69f6c3f37fab98c5a6e5ca493107bceff10d085d6d29b7bc0785`

## Local Reproduction

```bash
npm run verify:demo
npm run verify:duration
npm run verify:evidence
npm run verify:public-proof
npm run verify:github
npm run verify:pitch
npm run verify:judge
npm run verify:brief
npm run verify:review
npm run verify:review-links
npm run verify:recording-order
npm run verify:wallet
npm run verify:source
npm run verify:registry
npm run verify:plaza-flow
npm run verify:nova-alignment
npm run verify:submission
npm run verify:injective
```

This read-only proof suite verifies:

- `agentId 43-47` on Injective testnet
- `builderCode = pocket-earth`
- public data URI card shape for #44-47
- `/api/injective` read path for `ping`, `list-agents`, `get-status`, `get-reputation`, `get-chain-evidence`, and `get-wallet-timeline`
- review brief, reviewer checklist, competition alignment, submission links, submission checklist, and sourceControl wiring for public links, local proof commands, API-returned Blockscout link reachability, three-minute demo timing, followable recording order, registry mint event checks, plaza flow grouping, Nova story mapping, contest requirement coverage, current source commit anchoring, and final review entry points
- wallet timeline API output, public evidence `timeline` rows, and `timelineSummary` for registration, SocialHandshake deployment, fleet registration, and the real handshake transaction sequence, including shared `from` wallet and `expectedStatus` fields
- pitch notes that keep the deck centered on Injective proof, bound Frost Buddy hardware claims, and cite the Raspberry Pi source
- dry-run boundaries for write tools without key-backed confirmation
- ERC-8004 registry mint events and transaction hashes
- wallet evidence chain, RPC transaction/block timeline, deployed contract bytecode, handshake hash derivation, calldata, event, and public Blockscout links
- Frost Buddy hardware bridge events and the Raspberry Pi skill router stay public-only and contain no private keys, secret env names, raw profile text, or profile hashes

Note: `8004scan.io` does not index Injective testnet, so the public demo uses Injective Blockscout links above.

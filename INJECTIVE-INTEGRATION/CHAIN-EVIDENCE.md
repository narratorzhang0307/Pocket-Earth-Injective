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

Handshake calldata and event both decode to:

- `agentA`: `43`
- `agentB`: `44`
- `score`: `88`
- `profileHashA`: `0x7e8a254adf8ec98cacbf4f998433553532045748f6973d1be1e7a94d06165fb9`
- `profileHashB`: `0x34ec93bc1f4a69f6c3f37fab98c5a6e5ca493107bceff10d085d6d29b7bc0785`

## Local Reproduction

```bash
npm run verify:injective
```

This read-only proof suite verifies:

- `agentId 43-47` on Injective testnet
- `builderCode = pocket-earth`
- public data URI card shape for #44-47
- `/api/injective` read path for `ping`, `list-agents`, `get-status`, and `get-reputation`
- dry-run boundaries for write tools without key-backed confirmation
- ERC-8004 registry mint events and transaction hashes
- wallet evidence chain, deployed contract bytecode, handshake hash derivation, calldata, event, and public Blockscout links

Note: `8004scan.io` does not index Injective testnet, so the public demo uses Injective Blockscout links above.

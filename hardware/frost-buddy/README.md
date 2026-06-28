# Frost Buddy Hardware Bridge

Pocket Earth already has a software Frost Buddy in the app. This folder keeps the hardware side decoupled: it defines the event contract that can drive a Raspberry Pi / BLE / speaker prototype without pulling the ignored third-party firmware bundle into the public repo.

## What This Module Does

- Turns `music-agent` / Frost Radio activity into a physical "now playing" event.
- Turns Injective public-plaza chain dispatch into a physical "chain sights" event.
- Adds a Raspberry Pi skill router that can turn loose voice text into safe music commands or public chain-dispatch events.
- Emits newline-delimited JSON envelopes that a Raspberry Pi process can forward to BLE, serial, MQTT, local TTS, or a small display.
- Keeps the hardware bridge read-only: no private keys, no wallet signing, no raw Taste Passport, no precise location payload.

## Why It Matters

The hardware prototype is a light product signal, not the main Injective proof. It makes two existing Pocket Earth ideas tangible:

- **Music Agent physicalization**: Frost Radio can become a small desk object that speaks short DJ lines and reacts while music-agent is running.
- **On-chain sights physicalization**: Nightly Chain Dispatch can be spoken by the object after public-plaza reads `builderCode=pocket-earth` agents from Injective testnet.

## Event Contract

Run the demo:

```bash
node hardware/frost-buddy/frost-hardware-bridge.mjs demo
```

Output is JSONL. A Raspberry Pi adapter can read each line, speak `speak`, show `title/body`, and map `state` to the Frost Buddy expression.

```json
{"version":"0.1.0","kind":"chain_dispatch","source":"injective-public-plaza","state":"attention","priority":"urgent","title":"Injective chain dispatch","body":"builderCode=pocket-earth returned agentId 43-47 from Injective testnet.","speak":"Frost 在 Injective 链上遇见了 5 个 Pocket Earth agent。","agentIds":["43","44","45","46","47"],"scanUrl":"https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e","createdAt":"2026-06-29T00:00:01.000Z"}
```

## Hardware Path

Current repo-owned piece:

1. App / server creates public events.
2. `frost-hardware-bridge.mjs` converts them to safe JSONL.
3. `raspi/frost_pi_skill_agent.py` maps loose Pi voice requests to canonical music commands or public chain-dispatch events.
4. A future Raspberry Pi adapter reads JSONL and handles transport/audio.

Ignored local reference material:

- `Frost Buddy/claude-desktop-buddy-main/REFERENCE.md` documents the BLE-style hardware buddy protocol that inspired this bridge.
- `frost-agent/agents/music-agent`, `radio-24h-director`, and `script-tts-pipeline` define the existing music/radio/TTS product surface.
- Claude's isolated Sunset Radio Pi worktree was reviewed read-only for its skill-router pattern: whitelist skill registry, canonical command loopback, offline smoke checks, and tiny daemon hook. This repository keeps only a Pocket Earth specific, decoupled adaptation under `raspi/`.

## Source Notes

- Local source: `Frost Buddy/claude-desktop-buddy-main/REFERENCE.md` says the hardware bridge uses newline-delimited JSON over a BLE UART-style link and can be implemented by devices such as Arduino, ESP32, nRF52, or Raspberry Pi with BLE.
- Local source: `frost-agent/agents/music-agent/contract.md` separates music organization from radio playback, which is why this module treats hardware audio as a downstream runtime, not as music-agent core logic.
- Public context: Raspberry Pi's 2024 IPO filing says Raspberry Pi had sold over 60 million single-board computers and compute modules since 2012, which is enough to treat it as a credible maker/prototype platform without inventing market-size claims: https://data.fca.org.uk/artefacts/NSM/RNS/5182805.html

## Boundary

This folder is a bridge, not a hardware product launch. It should stay small until the physical Raspberry Pi process is ready. Keep future additions transport-specific and optional, for example:

- `adapters/ble-nus-pi.py` for BlueZ / Nordic UART transport.
- `adapters/local-tts-pi.mjs` for local speech.
- `adapters/display-pi.mjs` for a small OLED/e-ink screen.

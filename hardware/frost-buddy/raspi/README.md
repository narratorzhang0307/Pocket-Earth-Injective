# Raspberry Pi Skill Router

This folder is the repo-owned Raspberry Pi edge of Frost Buddy. It keeps the Pi work decoupled from Pocket Earth app code and from any larger local hardware daemon.

## What Was Reviewed

The existing Raspberry Pi prototype follows a useful safe-routing pattern:

- a self-contained `pi_skill_agent.py` skill registry,
- an offline smoke suite with drift checks,
- a tiny `pi_command_daemon.py` hook that sits after deterministic routes and before chat fallback.

The important idea is not to copy the whole daemon. The safe pattern is:

1. understand loose voice text,
2. validate the selected skill against a whitelist,
3. emit a canonical command or public event,
4. let the transport/audio layer handle the physical device.

## This Repo's Pi Module

`frost_pi_skill_agent.py` adapts that pattern for Pocket Earth x Injective:

- Music commands: next, previous, pause, replay, volume up/down.
- Music event: now-playing speech for a physical music-agent.
- Injective event: `chain_dispatch` speech after public-plaza reads `builderCode=pocket-earth` agents from Injective testnet.
- Safety: rejects private-key-like values, secret env names, and profile-hash-looking payloads before emitting JSONL.

Run the offline smoke:

```bash
python3 hardware/frost-buddy/raspi/frost_pi_skill_agent_smoke.py
```

No network, wallet, daemon, BLE device, or GitHub token is required.

## Decoupled Event Adapter Lane

`frost_pi_event_adapter.py` is the optional hardware branch after the JSONL
contract. It reads public Frost Buddy events and emits transport-neutral device
actions:

| Action | Intended hardware | Public fields used |
|---|---|---|
| `state` | LED, expression, tiny status screen | `state`, `priority`, `kind` |
| `tts` | local TTS, speaker, BLE audio trigger | `speak` |
| `display` | OLED, e-ink, web panel, MQTT dashboard | `title`, `body`, public `agentIds`, public `scanUrl` |

Run the adapter smoke:

```bash
python3 hardware/frost-buddy/raspi/frost_pi_event_adapter_smoke.py
```

The adapter does not import the app, the Injective API service, wallet code, or
any device daemon. BLE, serial, MQTT, and screen drivers should sit after this
file and map the emitted actions to physical output.

## Adapter Contract Matrix

| Layer | Owns | Must not own |
|---|---|---|
| Upstream JSONL contract | Public `music_now_playing`, `chain_dispatch`, and `buddy_status` envelopes from `frost-hardware-bridge.mjs` | Private profile text, wallet material, raw photos, precise coordinates, or transport-specific device commands |
| Pi action contract | `state`, `tts`, and `display` actions emitted by `frost_pi_event_adapter.py` | BLE pairing, serial writes, MQTT publish calls, local audio playback, or screen driver lifecycle |
| Transport driver | Mapping one action to one physical output such as LED, speaker, OLED, e-ink, BLE, serial, or MQTT | Expanding the event schema, reading Pocket Earth app stores, calling the Injective API, or signing transactions |
| Main app and Injective API | Generating public events, reading chain evidence, and enforcing user confirmation before writes | Depending on a Raspberry Pi process, importing a device daemon, or requiring hardware for the product path |

This matrix is the hardware boundary from the final deck in code form: Pocket
Earth can run without the Pi lane; the Pi lane can smoke-test without the app;
and physical drivers can be replaced without changing the public event schema.

## Boundary

This module is for `Pocket-Earth-Injective` only. If another local daemon later accepts this contract, connect it through a small adapter that consumes either:

- canonical commands such as `下一首`, or
- JSONL events such as `chain_dispatch`.

For physical output, prefer consuming adapter actions instead of expanding the
event envelope. That keeps Raspberry Pi experiments removable and keeps the
Pocket Earth main path independent from hardware transport choices.

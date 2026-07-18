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

For the authenticated, cursor-based HTTP handoff used by the physical Pi, see
[`LIVE-HANDOFF.md`](LIVE-HANDOFF.md). The feed client remains a thin consumer:
Pocket Earth owns live Injective reads and speech templates; the repo-owned
physical driver only consumes `state`, `tts`, and `display` actions.

`frost_pi_device_driver.py` is the implemented Whisplay HAT output lane. It maps
those actions to the 240×280 display, RGB LED, local MiniMax TTS with offline
fallback, and a phone mirror. It borrows and restores the existing Sunset Radio
framebuffer without importing Sunset Radio business code. BLE, serial, and MQTT
remain replaceable future transports after the same action contract.

The installed filesystem and process boundary is documented in
[`LINUX-LAYOUT.md`](LINUX-LAYOUT.md). Run the offline driver smoke with
`python3 frost_pi_device_driver_smoke.py`; on the Pi, run
`/home/pi/pocket-earth/frost_pi_live_preflight.py --strict`.

## PI Home launcher

`frost_pi_project_launcher.py` turns the clear `/home/pi` project tree into a
safe two-level Whisplay interface without exposing a destructive file manager:

- hold the orange button for 1.2 seconds to enter `PI HOME`,
- single-click to move between sibling projects or agents,
- hold for 1.2 seconds to open `SUNSET RADIO`, `POCKET EARTH`, or a selected agent,
- double-click to go back one level,
- single-click inside an agent page to move through its cached evidence cards,
- hold to go back one level.

Pocket Earth currently exposes six launcher pages: Frost identity, public
knowledge, AI news, finance, fact verifier, and chain dispatch. The launcher is
an independent `pocket-earth-launcher.service`; it subscribes to the existing
Whisplay button stream and switches foreground ownership through Whisplay IPC.
It does not import or edit Sunset Radio source code. Run its offline navigation
and 240×280 render check with `python3 frost_pi_project_launcher_smoke.py`.

`whisplay_pi_home_guard.py` suppresses the vendor Bluetooth/Wi-Fi/demo app
desktop once PI HOME is registered. It keeps a `.pre-pocket-earth` backup and
does not remove the maintenance implementations. Deployment installs this
small, reversible guard; strict live preflight requires it to remain active.
The launcher also listens for daemon-side focus revocation, so Whisplay's
quad-click gesture cannot leave its process falsely marked active while the
screen has already fallen back elsewhere.

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

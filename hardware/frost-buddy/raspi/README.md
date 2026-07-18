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
- single-click to move between sibling projects, modes, cities, songs, or agents,
- hold for 1.2 seconds to open or execute the selected item,
- double-click to go back one level,
- single-click inside an agent page to move through its cached evidence cards,
- double-click from `PI HOME` to return to the radio status screen.

`SUNSET RADIO` opens three device-native modes: `歌曲目录` directly flattens
the existing 96-city/621-track resource tree into one song list (no UTC or city
directory layer), `日落时刻` reuses Sunset Radio's real solar sunset calculator,
and `随机骰子` adapts the app's amber-on-night dice ritual. The song-directory
heading is centered in its black title bar. Once the dice lands, one click
plays the selected result; double-click still returns without playback. PI Home only reads the independent
radio catalog and posts a targeted command to its local API; it does not take
ownership of the radio database or player.

`POCKET EARTH` first opens three sibling spaces: `静默地球` is a clock-first,
sound-free home with a pixel globe, the shared Frost silhouette, and public
agent/knowledge status; `AGENTS` contains twelve evidence readers; `今日一页`
is an offline calendar with one of 31 original Pocket Earth decision prompts.
The clock and date refresh once per minute without network calls or TTS. This
borrows the low-distraction product logic of a pocket decision device, not its
brand, copy, fortune-telling, or visual assets.

Pocket Earth exposes twelve agent pages: Frost identity, public knowledge, all
eight FactAtlas topic agents (AI, technology, finance, climate, science,
health, culture, and policy), fact verifier, and chain dispatch. The device
ships two representative cards per topic from the real 37-card 07-15 snapshot,
with request receipts and explicit `待核验` labels; it does not relabel a
candidate as truth or invent the missing 07-16 edition. The launcher is
an independent `pocket-earth-launcher.service`; it subscribes to the existing
Whisplay button stream and switches foreground ownership through Whisplay IPC.
It does not import or edit Sunset Radio source code. Run its offline navigation
and 240×280 render checks with `python3 frost_pi_project_launcher_smoke.py` and
`python3 frost_pi_quiet_home_smoke.py`.

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

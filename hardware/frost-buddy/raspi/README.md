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

## Portable power gate

The strict live preflight also owns the PiSugar software boundary. A portable
node is ready only when the official `pisugar-server` is active and enabled,
the PiSugar 3 model uses I2C bus 1, the battery percentage is readable, the
shutdown-time `pisugar-poweroff` hook is enabled, and low-battery shutdown is
configured for 10% with a 30-second delay. CPU temperature must remain below
80°C. PiSugar chip temperature is reported separately when its I2C link is
available; it must not be confused with the Raspberry Pi CPU temperature.

`pisugar-poweroff.service` is expected to be inactive during normal operation:
it is a shutdown hook, so the strict check requires it to be **enabled**, not
running. If `power.batteryRaw` says `I2C not connected`, software installation
is complete but the physical battery board is not visible at the documented
PiSugar 3 addresses (`0x57`/`0x68`). Check with:

```bash
sudo /usr/sbin/i2cdetect -y 1
python3 /home/pi/pocket-earth/frost_pi_live_preflight.py --strict
```

Installation and socket commands follow the [official PiSugar 3 guide](https://docs.pisugar.com/docs/product-wiki/battery/pisugar3/pisugar-3-series)
and [PiSugar Power Manager guide](https://docs.pisugar.com/docs/product-wiki/battery/pisugar-power-manager).

## PI Home launcher

`frost_pi_project_launcher.py` turns the clear `/home/pi` project tree into a
safe Whisplay interface without exposing a destructive file manager. Its `口袋地球`
home presents three sibling capabilities: `日落电台`, `口袋播客`, and `地球答案`.

- hold the orange button for 1.2 seconds to enter `PI HOME`,
- single-click to move between sibling projects, modes, cities, songs, or agents,
- hold for 1.2 seconds to open or execute the selected item,
- double-click to go back one level,
- single-click inside an agent page to move through its cached evidence cards,
- double-click from `PI HOME` to return to the radio status screen.

`日落电台` opens three device-native modes: `歌曲目录` directly flattens
the existing 96-city/621-track resource tree into one song list (no UTC or city
directory layer), `日落时刻` reuses Sunset Radio's real solar sunset calculator,
and `随机骰子` adapts the app's amber-on-night dice ritual. The song-directory
heading is centered in its black title bar. Once the dice lands, one click
plays the selected result; double-click still returns without playback. PI Home only reads the independent
radio catalog and posts a targeted command to its local API; it does not take
ownership of the radio database or player.

`口袋播客` opens `播客模式` and `文字模式`. Both the software and the Pi consume
the same reviewed daily artifact. The Pi validates it, writes it atomically,
and keeps the last valid copy while offline. Single-click moves through the
verified segments; holding for 1.2 seconds speaks only the selected segment.
`FROST_DISABLE_TTS=1` keeps the audio lane silent during library or CI tests.
Text mode preserves the existing three
spaces: `静默地球` is a clock-first, sound-free home with a pixel globe, the
shared Frost silhouette, and public agent/knowledge status; `AGENTS` contains
twelve evidence readers; `今日一页` is an offline calendar with one of 31 original Pocket Earth decision prompts.
The clock and date refresh once per minute without network calls or TTS. This
borrows the low-distraction product logic of a pocket decision device, not its
brand, copy, fortune-telling, or visual assets.

`pocket-earth-podcast-sync.timer` refreshes the public artifact after boot and
at 08:20 Asia/Shanghai. Full candidate news remains in the server's seven-day
hot cache; the Pi receives only the reviewed podcast projection and its source
ledger. The bundled last-good artifact keeps the demo honest when the network
is unavailable.

`地球答案` is a separate annual action-guidance edition. It loads 365 reviewed
source excerpts from `/home/pi/earth-answers`, hides today's text until the user
holds for 1.2 seconds, persists the reveal locally, and lets a single click move
only backwards through history. Double-click always returns to `口袋地球`; no
button path can reveal tomorrow.

Pocket Earth exposes twelve agent pages: Frost identity, public knowledge, all
eight FactAtlas topic agents (AI, technology, finance, climate, science,
health, culture, and policy), fact verifier, and chain dispatch. The device
ships two representative cards per topic from the real 37-card 07-15 snapshot,
with request receipts and explicit `待核验` labels; it does not relabel a
candidate as truth or invent the missing 07-16 edition. The launcher is
an independent `pocket-earth-launcher.service`; it subscribes to the existing
Whisplay button stream and switches foreground ownership through Whisplay IPC.
It does not import or edit Sunset Radio source code. Run its offline navigation
and 240×280 render checks with `python3 frost_pi_project_launcher_smoke.py`,
`python3 frost_pi_earth_answers_smoke.py`, and `python3 frost_pi_quiet_home_smoke.py`.

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

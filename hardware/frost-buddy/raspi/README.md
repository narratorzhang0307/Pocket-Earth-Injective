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

## Boundary

This module is for `Pocket-Earth-Injective` only. If another local daemon later accepts this contract, connect it through a small adapter that consumes either:

- canonical commands such as `下一首`, or
- JSONL events such as `chain_dispatch`.

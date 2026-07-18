# Frost Edge Node Linux layout

Pocket Earth and Sunset Radio share one Raspberry Pi and one Whisplay HAT, but
they do not share an application directory, configuration file, process, log
stream, state file, or HTTP port. The Whisplay Unix socket is the only physical
display protocol they intentionally share.

## Directory ownership

| Path | Owner | Purpose | Persistence |
|---|---|---|---|
| `/home/pi/sunset-radio` | Sunset Radio | Existing music-agent application and assets | Persistent; Pocket Earth never writes here |
| `/home/pi/Whisplay` | Whisplay vendor runtime | Shared hardware daemon and protocol client | Persistent; Pocket Earth imports only the public runtime client |
| `/opt/pocket-earth-edge` | Pocket Earth | Versioned Python sidecar, adapter, driver, and smoke checks | Persistent, read-only during normal service operation |
| `/etc/pocket-earth-edge.env` | root | Feed URL and device bearer token | Persistent, mode `0600`, never committed or logged |
| `/var/lib/pocket-earth-edge` | Pocket Earth service | Durable feed cursor that prevents event replay | Persistent across reboot |
| `/var/cache/pocket-earth-edge` | Pocket Earth service | Reusable public TTS audio cache | Persistent but safe to clear |
| `/run/pocket-earth-edge` | Pocket Earth service | Current public screen mirror | Recreated on every boot |
| system journal | systemd | Service lifecycle and secret-free diagnostics | Managed by the operating system |

This follows the Linux filesystem split: application code under `/opt`, global
configuration under `/etc`, durable changing state under `/var/lib`, disposable
cache under `/var/cache`, and current-boot runtime material under `/run`.

## Agent namespace

`/home/pi` is the home directory of the operating-system user named `pi`; it is
not the architectural root of Pocket Earth. Trusted Pocket Earth sub-agents are
parallel branches inside the Pocket Earth namespace instead:

```text
/opt/pocket-earth-edge/agents/<agent-key>/          # code or reviewed manifest
/etc/pocket-earth-edge/agents.d/<agent-key>.conf    # system configuration
/var/lib/pocket-earth-edge/agents/<agent-key>/      # durable agent state
/run/pocket-earth-edge/agents/<agent-key>/          # current invocation state
```

The current Pi does not need a copy of every Agent Plaza or public-news agent.
Those agents run on the server; the Pi installs only physical adapters for the
public events it can render, speak, or signal. A future untrusted third-party
agent should graduate from a sibling directory to its own Linux user, systemd
unit, or container. Directory separation alone is not a security boundary.

Sunset Radio is the deliberate legacy exception. Its complete music-agent
runtime stays in `/home/pi/sunset-radio`; Pocket Earth does not duplicate or
move it during the final sprint. Pocket Earth owns only the transport-neutral
`music_now_playing` action path and physical output adapter. If the radio later
becomes a first-class built-in Pocket Earth agent, its reviewed module can move
to `/opt/pocket-earth-edge/agents/music-agent/` in a separate migration.

## Process and port isolation

| Unit / endpoint | Role |
|---|---|
| `sunset-radio.service` · `:8080` | Existing radio API and local MiniMax TTS endpoint |
| `sunset-radio-whisplay.service` | Existing animated music-agent screen |
| `whisplay-daemon.service` · `/tmp/whisplay-daemon.sock` | Vendor-owned screen, LED, and button protocol |
| `pocket-earth-edge.service` · `:8766` | Authenticated feed consumer and public phone mirror |

`pocket-earth-edge.service` runs as the unprivileged `pi` user and receives only
the supplementary device groups required by the HAT. The feed token is read by
systemd from the root-owned environment file. It is not placed in a command,
Git, application output, or journal line.

## Event boundary

```text
Pocket Earth server (live Injective read + server-owned speech)
  -> authenticated /api/frost-feed + replay cursor
  -> frost_pi_event_adapter.py (public state/tts/display actions)
  -> frost_pi_device_driver.py
       -> Whisplay framebuffer + RGB LED
       -> local MiniMax TTS, offline espeak fallback
       -> public phone mirror on :8766
```

The driver borrows the active Sunset Radio framebuffer session for one public
evidence card, releases it, and asks Whisplay to launch the previous app again.
It never imports Sunset Radio business code and never stops the radio API. A
Whisplay request has a five-second timeout so a device daemon failure cannot
create an unbounded blocked process.

## Recovery and verification

```bash
python3 /opt/pocket-earth-edge/frost_pi_live_preflight.py --strict
systemctl status pocket-earth-edge.service
journalctl -u pocket-earth-edge.service -b
curl http://127.0.0.1:8766/healthz
```

Removing `pocket-earth-edge.service`, `/opt/pocket-earth-edge`, and its three
owned data directories removes the Pocket Earth hardware lane without touching
Sunset Radio. Conversely, stopping Sunset Radio does not remove the Pocket
Earth feed contract or its committed replay cursor.

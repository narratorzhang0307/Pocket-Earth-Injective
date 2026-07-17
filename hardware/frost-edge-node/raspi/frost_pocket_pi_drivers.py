#!/usr/bin/env python3
"""HW-02: real-device drivers for the Frost Edge Node sidecar.

Maps the frozen adapter's actions onto the sunset-radio base WITHOUT touching
any sunset-radio file, using only its public local surfaces (recipe:
docs/sunset-radio-integration-recon.md):

- display -> POST /api/pi-state {"message": ...}   (intertitle card, ~2.5s pickup;
             never acquires the Whisplay foreground -- acquiring would freeze
             the radio screen and trigger its 180s daemon-restart rescue)
- tts     -> audio_mode dialog gate + /tmp tts marker + POST /api/pi-tts (mp3),
             espeak-ng offline fallback; soft_mute is respected by default
- state   -> transient LED flash via whisplay-daemon unix socket (global cmd,
             no foreground needed; radio pet mood re-asserts within 30s)

Failure semantics (consumer keeps the cursor only if dispatch raises):
- show_card raises on failure (core deliverable -> retry with backoff),
- speak / apply_state degrade silently (voice and light are secondary).

All config is read lazily from env so tests can override per call.
"""

import importlib.util
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request

_DEF = {
    "SUNSET_API": "http://127.0.0.1:8080",
    "SUNSET_RASPI_DIR": "/home/pi/sunset-radio/raspi",
    "WHISPLAY_SOCK": "/tmp/whisplay-daemon.sock",
    "FROST_TTS_MARKER": "/tmp/sunset-radio-tts-active",
}

STATE_LED = {
    "attention": (120, 60, 255),   # Injective purple
    "busy": (255, 140, 40),        # warm orange (music)
}

DIALOG_TTL_SEC = 25
PLAY_TIMEOUT_SEC = 22


def _env(key):
    return os.environ.get(key, _DEF.get(key, ""))


def _log(message):
    print(f"frost_pocket_pi_drivers: {message}", file=sys.stderr)


def _post_json(url, payload, timeout=3.0):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    return urllib.request.urlopen(request, timeout=timeout)


def _load_audio_mode_module():
    """Read-only import of sunset-radio's audio_mode.py (gate logic reuse)."""
    path = os.path.join(_env("SUNSET_RASPI_DIR"), "audio_mode.py")
    if not os.path.exists(path):
        return None
    spec = importlib.util.spec_from_file_location("sunset_audio_mode", path)
    if spec is None or spec.loader is None:
        return None
    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)
    except Exception as exc:
        _log(f"audio_mode import failed: {exc}")
        return None
    return module


def _card_text(action):
    title = str(action.get("title") or "").strip()
    body = str(action.get("body") or "").strip()
    subtitle = str(action.get("subtitle") or "").strip()
    parts = [p for p in (title, subtitle) if p]
    text = " · ".join(parts)
    if body and body not in text:
        text = f"{text}｜{body}" if text else body
    return text[:180]


def show_card(action):
    """display action -> intertitle card via /api/pi-state (raises on failure)."""
    text = _card_text(action)
    if not text:
        return
    with _post_json(f"{_env('SUNSET_API')}/api/pi-state", {"message": text}) as resp:
        if resp.status != 200:
            raise RuntimeError(f"pi-state returned {resp.status}")
    _log(f"card shown ({action.get('sourceKind')})")


def speak(action):
    """tts action -> gated speech. Soft-muted: skip (display card still shows)."""
    text = str(action.get("text") or "").strip()[:78]
    if not text:
        return
    audio_mode = _load_audio_mode_module()
    force = os.environ.get("FROST_TTS_FORCE", "") == "1"
    if audio_mode is None:
        if not force:
            _log("audio_mode unavailable; staying silent (card only)")
            return
    else:
        state = audio_mode.load_audio_mode()
        if not force and not audio_mode.audio_allows_dialog(state):
            _log(f"audio mode {state.get('mode')} blocks speech; card only")
            return
        try:
            audio_mode.save_audio_mode("dialog", ttl_sec=DIALOG_TTL_SEC,
                                       reason="frost edge node dispatch")
        except Exception as exc:
            _log(f"could not enter dialog mode: {exc}")

    marker = _env("FROST_TTS_MARKER")
    try:
        with open(marker, "w", encoding="utf-8") as fh:
            fh.write(str(int(time.time())))
    except OSError:
        pass
    try:
        if not _speak_via_server(text):
            _speak_via_espeak(text)
    finally:
        try:
            os.unlink(marker)
        except OSError:
            pass


def _speak_via_server(text):
    try:
        with _post_json(f"{_env('SUNSET_API')}/api/pi-tts", {"text": text},
                        timeout=15.0) as resp:
            if "audio/" not in (resp.headers.get("Content-Type") or ""):
                return False
            audio = resp.read()
    except Exception as exc:
        _log(f"pi-tts unreachable: {exc}")
        return False
    player = _pick_player()
    if not player:
        return False
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as fh:
        fh.write(audio)
        mp3 = fh.name
    try:
        subprocess.run(player + [mp3], timeout=PLAY_TIMEOUT_SEC, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception as exc:
        _log(f"player failed: {exc}")
        return False
    finally:
        try:
            os.unlink(mp3)
        except OSError:
            pass


def _pick_player():
    override = os.environ.get("FROST_TTS_PLAYER", "")
    if override:
        return override.split()
    if shutil.which("ffplay"):
        return ["ffplay", "-nodisp", "-autoexit", "-loglevel", "error"]
    if shutil.which("mpg123"):
        return ["mpg123", "-q"]
    if shutil.which("cvlc"):
        return ["cvlc", "--play-and-exit", "--intf", "dummy"]
    return None


def _speak_via_espeak(text):
    espeak = os.environ.get("FROST_ESPEAK_CMD", "espeak-ng")
    try:
        subprocess.run([espeak, "-v", "zh", "-s", "150", text],
                       timeout=PLAY_TIMEOUT_SEC, check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as exc:
        _log(f"espeak fallback failed: {exc}")


def apply_state(action):
    """state action -> transient LED flash via whisplay-daemon (never fatal)."""
    color = STATE_LED.get(str(action.get("state") or ""))
    if not color:
        return
    payload = {
        "version": 1,
        "cmd": "led.fade",
        "payload": {"r": color[0], "g": color[1], "b": color[2], "duration_ms": 600},
    }
    try:
        client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        client.settimeout(2.0)
        client.connect(_env("WHISPLAY_SOCK"))
        client.sendall((json.dumps(payload) + "\n").encode("utf-8"))
        client.makefile("r", encoding="utf-8").readline()
        client.close()
        _log(f"led flash for state={action.get('state')}")
    except OSError as exc:
        _log(f"led unavailable (skipped): {exc}")

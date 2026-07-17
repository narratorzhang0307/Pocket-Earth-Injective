#!/usr/bin/env python3
"""Offline smoke for the HW-02 Pi drivers. Stdlib only, no Pi required.

Mocks the three public surfaces (radio HTTP server, audio_mode module,
whisplay-daemon unix socket) and verifies gate/marker/fallback semantics.
"""

import json
import os
import socketserver
import stat
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import frost_pocket_pi_drivers as drivers  # noqa: E402

CHECKS = []


def check(name, condition, detail=""):
    CHECKS.append((name, bool(condition)))
    print(f"{'PASS' if condition else 'FAIL'}  {name}" + (f"  [{detail}]" if detail and not condition else ""))


DISPLAY_ACTION = {
    "type": "display", "title": "Injective chain dispatch",
    "subtitle": "agentId 43/44/45/46/47",
    "body": "builderCode=pocket-earth returned agentId 43-47 from Injective testnet.",
    "sourceKind": "chain_dispatch",
}
TTS_ACTION = {"type": "tts", "text": "Frost 在 Injective 链上遇见了 5 个 Pocket Earth agent。"}
STATE_ACTION = {"type": "state", "state": "attention"}


class _RadioHandler(BaseHTTPRequestHandler):
    tts_ok = True
    seen = []

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        payload = json.loads(self.rfile.read(length) or b"{}")
        type(self).seen.append({"path": self.path, "payload": payload})
        if self.path == "/api/pi-state":
            body = b'{"ok":true}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
        elif self.path == "/api/pi-tts" and self.tts_ok:
            body = b"FAKE-MP3-BYTES"
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
        else:  # tts error path: HTTP 200 but JSON body (real server behavior)
            body = b'{"ok":false}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


class _LedHandler(socketserver.StreamRequestHandler):
    def handle(self):
        line = self.rfile.readline().decode("utf-8")
        self.server.payloads.append(json.loads(line))
        self.wfile.write(b'{"ok":true}\n')


def _write_stub_env(tmp):
    raspi = Path(tmp) / "raspi-stub"
    raspi.mkdir()
    (raspi / "audio_mode.py").write_text(
        "import json, os\n"
        "def load_audio_mode():\n"
        "    return {'mode': os.environ.get('STUB_AUDIO_MODE', 'soft_mute')}\n"
        "def audio_allows_dialog(state):\n"
        "    return state.get('mode') in ('dialog', 'radio')\n"
        "def save_audio_mode(mode, ttl_sec=0, reason=''):\n"
        "    open(os.environ['STUB_AUDIO_CALLS'], 'a').write(\n"
        "        json.dumps({'mode': mode, 'ttl': ttl_sec}) + '\\n')\n",
        encoding="utf-8",
    )
    player_log = Path(tmp) / "player.log"
    player = Path(tmp) / "fake-player.sh"
    player.write_text(
        "#!/bin/sh\n"
        'if [ -f "$FROST_TTS_MARKER" ]; then echo "present $1" >> "$PLAYER_LOG";'
        ' else echo "absent $1" >> "$PLAYER_LOG"; fi\n',
        encoding="utf-8",
    )
    player.chmod(player.stat().st_mode | stat.S_IEXEC)
    espeak_log = Path(tmp) / "espeak.log"
    espeak = Path(tmp) / "fake-espeak.sh"
    espeak.write_text('#!/bin/sh\necho "$@" >> "$ESPEAK_LOG"\n', encoding="utf-8")
    espeak.chmod(espeak.stat().st_mode | stat.S_IEXEC)
    return raspi, player, player_log, espeak, espeak_log


def main():
    tmp = tempfile.mkdtemp(prefix="frost-drivers-smoke-")
    raspi, player, player_log, espeak, espeak_log = _write_stub_env(tmp)

    http_server = HTTPServer(("127.0.0.1", 0), _RadioHandler)
    threading.Thread(target=http_server.serve_forever, daemon=True).start()

    led_sock = str(Path(tmp) / "whisplay.sock")
    led_server = socketserver.ThreadingUnixStreamServer(led_sock, _LedHandler)
    led_server.payloads = []
    threading.Thread(target=led_server.serve_forever, daemon=True).start()

    marker = str(Path(tmp) / "tts-active")
    os.environ.update({
        "SUNSET_API": f"http://127.0.0.1:{http_server.server_port}",
        "SUNSET_RASPI_DIR": str(raspi),
        "WHISPLAY_SOCK": led_sock,
        "FROST_TTS_MARKER": marker,
        "FROST_TTS_PLAYER": str(player),
        "FROST_ESPEAK_CMD": str(espeak),
        "STUB_AUDIO_CALLS": str(Path(tmp) / "audio-calls.log"),
        "PLAYER_LOG": str(player_log),
        "ESPEAK_LOG": str(espeak_log),
    })

    # 1) display card
    drivers.show_card(DISPLAY_ACTION)
    posted = [s for s in _RadioHandler.seen if s["path"] == "/api/pi-state"]
    message = posted[-1]["payload"].get("message", "") if posted else ""
    check("card posted to pi-state", bool(posted))
    check("card keeps only message key", posted and list(posted[-1]["payload"]) == ["message"])
    check("card text carries title+ids+body",
          "Injective chain dispatch" in message and "43/44/45/46/47" in message
          and "pocket-earth" in message)

    # 2) soft_mute blocks speech entirely
    os.environ["STUB_AUDIO_MODE"] = "soft_mute"
    drivers.speak(TTS_ACTION)
    tts_calls = [s for s in _RadioHandler.seen if s["path"] == "/api/pi-tts"]
    check("soft_mute: no tts request", not tts_calls)
    check("soft_mute: no marker left", not os.path.exists(marker))
    check("soft_mute: player never ran", not player_log.exists())

    # 3) dialog mode: server tts + marker present during playback, removed after
    os.environ["STUB_AUDIO_MODE"] = "dialog"
    drivers.speak(TTS_ACTION)
    tts_calls = [s for s in _RadioHandler.seen if s["path"] == "/api/pi-tts"]
    played = player_log.read_text(encoding="utf-8").strip().splitlines() if player_log.exists() else []
    check("dialog: tts requested", len(tts_calls) == 1)
    check("dialog: marker present during playback", played and played[-1].startswith("present"))
    check("dialog: marker removed after", not os.path.exists(marker))
    audio_calls = Path(os.environ["STUB_AUDIO_CALLS"]).read_text(encoding="utf-8")
    check("dialog: dialog mode requested with ttl", '"mode": "dialog"' in audio_calls and '"ttl": 25' in audio_calls)

    # 4) tts server error -> espeak fallback
    _RadioHandler.tts_ok = False
    drivers.speak(TTS_ACTION)
    check("fallback: espeak invoked", espeak_log.exists() and "Frost" in espeak_log.read_text(encoding="utf-8"))
    check("fallback: marker removed after", not os.path.exists(marker))

    # 5) LED flash via daemon socket
    drivers.apply_state(STATE_ACTION)
    check("led.fade sent", led_server.payloads and led_server.payloads[-1]["cmd"] == "led.fade")
    check("led purple for attention", led_server.payloads and led_server.payloads[-1]["payload"]["r"] == 120)

    # 6) degradation: daemon socket gone -> silent skip; radio server gone -> card raises
    os.environ["WHISPLAY_SOCK"] = str(Path(tmp) / "missing.sock")
    try:
        drivers.apply_state(STATE_ACTION)
        check("led silent skip when daemon absent", True)
    except Exception as exc:
        check("led silent skip when daemon absent", False, str(exc))
    http_server.shutdown()
    try:
        drivers.show_card(DISPLAY_ACTION)
        check("card raises when server down", False)
    except Exception:
        check("card raises when server down", True)

    led_server.shutdown()
    failed = [n for n, ok in CHECKS if not ok]
    print(f"\n{len(CHECKS) - len(failed)}/{len(CHECKS)} checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())

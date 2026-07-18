#!/usr/bin/env python3
"""Secret-free live readiness report for the physical Frost Edge Node."""

import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen


def _command(*args):
    try:
        return subprocess.run(args, text=True, capture_output=True, timeout=5, check=False)
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        return subprocess.CompletedProcess(args, 127, "", str(exc))


def _active(unit):
    return _command("systemctl", "is-active", unit).stdout.strip() == "active"


def _wifi():
    result = _command("nmcli", "-t", "-f", "ACTIVE,SSID", "dev", "wifi")
    for line in result.stdout.splitlines():
        if line.startswith("yes:"):
            return line[4:]
    return ""


def _whisplay_request(cmd="health.ping", payload=None):
    path = "/tmp/whisplay-daemon.sock"
    try:
        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
            client.settimeout(3)
            client.connect(path)
            request = json.dumps({"version": 1, "cmd": cmd, "payload": payload or {}}) + "\n"
            client.sendall(request.encode())
            response = json.loads(client.makefile("r").readline())
        return response if response.get("ok") is True else {}
    except (OSError, ValueError, json.JSONDecodeError):
        return {}


def _whisplay_state():
    health = _whisplay_request()
    apps = _whisplay_request("app.list").get("payload", {}).get("apps", [])
    selected = next((app.get("app_id", "") for app in apps if app.get("selected")), "")
    return {
        "responding": bool(health),
        "foreground": health.get("payload", {}).get("foreground_app_id", ""),
        "safeForeground": health.get("payload", {}).get("foreground_app_id", "") in {
            "sunset-radio-status", "pocket-earth-launcher", "pocket-earth-edge"
        },
        "desktopDefault": selected,
        "safeDesktopDefault": selected == "pocket-earth-launcher",
    }


def _cjk_font():
    try:
        from frost_pi_device_driver import cjk_font_status
        ok, path = cjk_font_status()
        return {"glyphs": ok, "path": path}
    except (ImportError, OSError, ValueError) as exc:
        return {"glyphs": False, "path": str(exc)}


def _vendor_desktop_suppressed():
    try:
        from whisplay_pi_home_guard import guarded
        return guarded(Path("/home/pi/Whisplay/daemon/whisplay_daemon.py"))
    except (ImportError, OSError, ValueError):
        return False


def _mirror():
    try:
        with urlopen("http://127.0.0.1:8766/healthz", timeout=3) as response:
            return response.status == 200 and json.loads(response.read()).get("ok") is True
    except (URLError, TimeoutError, OSError, ValueError):
        return False


def main(argv=None):
    parser = argparse.ArgumentParser(description="Check the live Pocket Earth Raspberry Pi lane")
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args(argv)
    state_cursor = Path("/var/lib/pocket-earth-edge/frost-feed.cursor")
    legacy_cursor = Path.home() / ".local" / "state" / "pocket-earth" / "frost-feed.cursor"
    cursor = state_cursor if state_cursor.exists() else legacy_cursor
    runtime_snapshot = Path("/run/pocket-earth-edge/live.png")
    legacy_snapshot = Path("/tmp/pocket-earth-edge-live.png")
    snapshot = Path(os.environ.get(
        "FROST_MIRROR_PATH",
        str(runtime_snapshot if runtime_snapshot.exists() else legacy_snapshot),
    ))
    whisplay = _whisplay_state()
    cjk = _cjk_font()
    report = {
        "ok": True,
        "hostname": socket.gethostname(),
        "wifi": _wifi(),
        "services": {
            "networkManager": _active("NetworkManager.service"),
            "ssh": _active("ssh.service"),
            "whisplay": _active("whisplay-daemon.service"),
            "sunsetRadio": _active("sunset-radio.service"),
            "pocketEarthEdge": _active("pocket-earth-edge.service"),
            "projectLauncher": _active("pocket-earth-launcher.service"),
        },
        "hardware": {
            "whisplayResponding": whisplay["responding"],
            "foreground": whisplay["foreground"],
            "safeForeground": whisplay["safeForeground"],
            "desktopDefault": whisplay["desktopDefault"],
            "safeDesktopDefault": whisplay["safeDesktopDefault"],
            "vendorDesktopSuppressed": _vendor_desktop_suppressed(),
            "cjkFont": cjk["path"],
            "cjkGlyphs": cjk["glyphs"],
            "speakerPlayer": bool(shutil.which("ffplay")),
            "offlineTts": bool(shutil.which("espeak-ng") or shutil.which("espeak")),
        },
        "eventLane": {
            "cursorPath": str(cursor),
            "snapshotPath": str(snapshot),
            "mirrorResponding": _mirror(),
            "snapshotReady": snapshot.is_file() and snapshot.stat().st_size > 1024,
            "cursorCommitted": cursor.is_file() and cursor.stat().st_size > 8,
        },
    }
    critical = [
        report["services"]["networkManager"],
        report["services"]["ssh"],
        report["services"]["whisplay"],
        report["services"]["pocketEarthEdge"],
        report["services"]["projectLauncher"],
        report["hardware"]["whisplayResponding"],
        report["hardware"]["safeForeground"],
        report["hardware"]["vendorDesktopSuppressed"],
        report["hardware"]["cjkGlyphs"],
        report["hardware"]["speakerPlayer"],
        report["hardware"]["offlineTts"],
        report["eventLane"]["mirrorResponding"],
    ]
    report["ok"] = all(critical)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["ok"] or not args.strict else 2


if __name__ == "__main__":
    raise SystemExit(main())

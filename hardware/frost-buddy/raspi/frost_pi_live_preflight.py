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
    return subprocess.run(args, text=True, capture_output=True, timeout=5, check=False)


def _active(unit):
    return _command("systemctl", "is-active", unit).stdout.strip() == "active"


def _wifi():
    result = _command("nmcli", "-t", "-f", "ACTIVE,SSID", "dev", "wifi")
    for line in result.stdout.splitlines():
        if line.startswith("yes:"):
            return line[4:]
    return ""


def _whisplay():
    path = "/tmp/whisplay-daemon.sock"
    try:
        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
            client.settimeout(3)
            client.connect(path)
            request = json.dumps({"version": 1, "cmd": "health.ping", "payload": {}}) + "\n"
            client.sendall(request.encode())
            response = json.loads(client.makefile("r").readline())
        return response.get("ok") is True
    except (OSError, ValueError, json.JSONDecodeError):
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
    cursor = Path.home() / ".local" / "state" / "pocket-earth" / "frost-feed.cursor"
    snapshot = Path(os.environ.get("FROST_MIRROR_PATH", "/tmp/pocket-earth-edge-live.png"))
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
        },
        "hardware": {
            "whisplayResponding": _whisplay(),
            "speakerPlayer": bool(shutil.which("ffplay")),
            "offlineTts": bool(shutil.which("espeak-ng") or shutil.which("espeak")),
        },
        "eventLane": {
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
        report["hardware"]["whisplayResponding"],
        report["hardware"]["speakerPlayer"],
        report["hardware"]["offlineTts"],
        report["eventLane"]["mirrorResponding"],
    ]
    report["ok"] = all(critical)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["ok"] or not args.strict else 2


if __name__ == "__main__":
    raise SystemExit(main())

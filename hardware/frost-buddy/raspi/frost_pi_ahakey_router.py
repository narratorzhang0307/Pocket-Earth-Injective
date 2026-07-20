#!/usr/bin/env python3
"""Route AhaKey F13-F16 presses into the Pocket Earth Whisplay launcher."""

from __future__ import annotations

import os
import select
import socket
import struct
import sys
import time
from pathlib import Path


CONTROL_SOCKET_PATH = Path(
    os.environ.get("POCKET_EARTH_CONTROL_SOCKET", "/run/pocket-earth-edge/launcher-control.sock")
)
INPUT_ROOT = Path(os.environ.get("POCKET_EARTH_INPUT_ROOT", "/sys/class/input"))
DEVICE_TOKEN = os.environ.get("AHAKEY_DEVICE_TOKEN", "ahakey").casefold()

EV_KEY = 0x01
KEY_PRESSED = 1
KEY_ROUTES = {
    183: "podcast",  # F13
    184: "answers",  # F14
    185: "sunset",   # F15
    186: "home",     # F16
}
INPUT_EVENT = struct.Struct("llHHi")


def find_ahakey_event_paths(input_root: Path = INPUT_ROOT) -> list[Path]:
    matches: list[Path] = []
    for event in sorted(input_root.glob("event*")):
        try:
            name = (event / "device" / "name").read_text(encoding="utf-8").strip()
        except OSError:
            continue
        if DEVICE_TOKEN in name.casefold():
            matches.append(Path("/dev/input") / event.name)
    return matches


def parse_input_events(buffer: bytes) -> tuple[list[tuple[int, int, int]], bytes]:
    events: list[tuple[int, int, int]] = []
    complete = len(buffer) - (len(buffer) % INPUT_EVENT.size)
    for offset in range(0, complete, INPUT_EVENT.size):
        _sec, _usec, event_type, code, value = INPUT_EVENT.unpack_from(buffer, offset)
        events.append((event_type, code, value))
    return events, buffer[complete:]


def send_route(target: str, socket_path: Path = CONTROL_SOCKET_PATH) -> None:
    with socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM) as client:
        client.sendto(target.encode("ascii"), str(socket_path))


def watch_device(path: Path) -> None:
    print(f"ahakey-router: listening on {path}", flush=True)
    with path.open("rb", buffering=0) as device:
        buffer = b""
        while True:
            ready, _, _ = select.select([device], [], [], 1.0)
            if not ready:
                continue
            chunk = os.read(device.fileno(), INPUT_EVENT.size * 16)
            if not chunk:
                raise OSError("AhaKey input device disconnected")
            events, buffer = parse_input_events(buffer + chunk)
            for event_type, code, value in events:
                target = KEY_ROUTES.get(code)
                if event_type != EV_KEY or value != KEY_PRESSED or not target:
                    continue
                try:
                    send_route(target)
                    print(f"ahakey-router: key={code} route={target}", flush=True)
                except OSError as exc:
                    print(f"ahakey-router: launcher unavailable: {exc}", flush=True)


def main() -> int:
    while True:
        paths = find_ahakey_event_paths()
        if not paths:
            time.sleep(2.0)
            continue
        try:
            watch_device(paths[0])
        except (OSError, ValueError) as exc:
            print(f"ahakey-router: reopening after disconnect: {exc}", flush=True)
            time.sleep(1.0)
        except KeyboardInterrupt:
            return 0


if __name__ == "__main__":
    raise SystemExit(main())

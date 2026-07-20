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
DEBOUNCE_SECONDS = float(os.environ.get("AHAKEY_DEBOUNCE_SECONDS", "0.35"))
ROUTE_RETRIES = int(os.environ.get("AHAKEY_ROUTE_RETRIES", "3"))
ROUTE_RETRY_SECONDS = float(os.environ.get("AHAKEY_ROUTE_RETRY_SECONDS", "0.08"))

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


def send_route_with_retry(target: str, socket_path: Path = CONTROL_SOCKET_PATH) -> None:
    last_error: OSError | None = None
    for attempt in range(ROUTE_RETRIES):
        try:
            send_route(target, socket_path)
            return
        except OSError as exc:
            last_error = exc
            if attempt + 1 < ROUTE_RETRIES:
                time.sleep(ROUTE_RETRY_SECONDS)
    assert last_error is not None
    raise last_error


def should_route_press(code: int, value: int, now: float, last_presses: dict[int, float]) -> bool:
    if value != KEY_PRESSED or code not in KEY_ROUTES:
        return False
    previous = last_presses.get(code)
    if previous is not None and now - previous < DEBOUNCE_SECONDS:
        return False
    last_presses[code] = now
    return True


def watch_devices(paths: list[Path]) -> None:
    devices = [path.open("rb", buffering=0) for path in paths]
    buffers = {device.fileno(): b"" for device in devices}
    last_presses: dict[int, float] = {}
    print("ahakey-router: listening on " + ", ".join(map(str, paths)), flush=True)
    try:
        while True:
            ready, _, _ = select.select(devices, [], [], 1.0)
            for device in ready:
                chunk = os.read(device.fileno(), INPUT_EVENT.size * 16)
                if not chunk:
                    raise OSError("AhaKey input device disconnected")
                events, buffers[device.fileno()] = parse_input_events(buffers[device.fileno()] + chunk)
                for event_type, code, value in events:
                    if event_type != EV_KEY or not should_route_press(code, value, time.monotonic(), last_presses):
                        continue
                    target = KEY_ROUTES[code]
                    try:
                        send_route_with_retry(target)
                        print(f"ahakey-router: key={code} route={target}", flush=True)
                    except OSError as exc:
                        print(f"ahakey-router: launcher unavailable after retries: {exc}", flush=True)
    finally:
        for device in devices:
            device.close()


def main() -> int:
    while True:
        paths = find_ahakey_event_paths()
        if not paths:
            time.sleep(2.0)
            continue
        try:
            watch_devices(paths)
        except (OSError, ValueError) as exc:
            print(f"ahakey-router: reopening after disconnect: {exc}", flush=True)
            time.sleep(1.0)
        except KeyboardInterrupt:
            return 0


if __name__ == "__main__":
    raise SystemExit(main())

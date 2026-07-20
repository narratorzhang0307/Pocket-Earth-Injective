#!/usr/bin/env python3
"""Write the Pocket Earth Mode 4 key and light configuration to AhaKey X1."""

from __future__ import annotations

import argparse
import os
import subprocess
import time


AHAKEY_MAC = os.environ.get("AHAKEY_MAC", "D4:6C:50:5C:F6:93")
COMMAND_UUID = "00007343-0000-1000-8000-00805f9b34fb"
SERVICE_UUID = "00007340-0000-1000-8000-00805f9b34fb"
MODE = 3
CONNECT_WINDOW_SECONDS = 45.0
CONNECT_RETRY_SECONDS = 0.8


def frame(command: int, *payload: int) -> bytes:
    return bytes((0xAA, 0xBB, command, *payload, 0xCC, 0xDD))


def status_query() -> bytes:
    """Return the official device-status query used as a quiet keepalive."""
    return frame(0x00)


def mapping(key_index: int, hid_code: int) -> bytes:
    return frame(0x73, 0x73, MODE, key_index, hid_code)


def clear_macro(key_index: int) -> bytes:
    return frame(0x73, 0x74, MODE, key_index)


def description(key_index: int, text: str) -> bytes:
    clean = text.encode("ascii", errors="ignore")[:20]
    return frame(0x73, 0x75, MODE, key_index, *clean)


def pocket_earth_commands() -> list[bytes]:
    keys = (
        (0, 0x68, "POCKET PODCAST"),
        (1, 0x69, "EARTH ANSWER"),
        (2, 0x6A, "SUNSET RADIO"),
        (3, 0x6B, "POCKET EARTH HOME"),
    )
    commands: list[bytes] = []
    for key_index, hid_code, label in keys:
        commands.extend((clear_macro(key_index), mapping(key_index, hid_code), description(key_index, label)))
    commands.extend(
        (
            frame(0x84, MODE, *([0] * 9)),  # all IDE states -> light effect OFF
            frame(0x85, 1),                 # minimum stored brightness
            frame(0x92, MODE),              # activate Mode 4
            frame(0x04),                    # save to flash
        )
    )
    return commands


def bluetoothctl(*arguments: str, timeout: float = 15.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["bluetoothctl", *arguments],
        check=False,
        capture_output=True,
        text=True,
        timeout=timeout,
    )


def connected_and_ready() -> bool:
    info = bluetoothctl("info", AHAKEY_MAC)
    services_ready = "ServicesResolved: yes" in info.stdout or SERVICE_UUID in info.stdout
    return "Connected: yes" in info.stdout and services_ready


def ensure_connected() -> None:
    deadline = time.monotonic() + CONNECT_WINDOW_SECONDS
    attempts = 0
    while time.monotonic() < deadline:
        if connected_and_ready():
            return
        attempts += 1
        bluetoothctl("connect", AHAKEY_MAC, timeout=6.0)
        if connected_and_ready():
            return
        time.sleep(CONNECT_RETRY_SECONDS)
    info = bluetoothctl("info", AHAKEY_MAC).stdout.strip().replace("\n", "; ")
    raise RuntimeError(
        f"AhaKey GATT service not ready after {attempts} attempts; {info[:500]}"
    )


def write_commands(commands: list[bytes]) -> str:
    ensure_connected()

    process = subprocess.Popen(
        ["bluetoothctl"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    assert process.stdin is not None
    process.stdin.write("menu gatt\n")
    process.stdin.write(f"select-attribute {COMMAND_UUID}\n")
    process.stdin.flush()
    time.sleep(0.8)
    for command in commands:
        process.stdin.write("write " + " ".join(f"{byte:02x}" for byte in command) + "\n")
        process.stdin.flush()
        time.sleep(0.22)
    process.stdin.write("back\nquit\n")
    process.stdin.flush()
    output, _ = process.communicate(timeout=15)
    if "Failed" in output or "not available" in output.lower():
        raise RuntimeError(output)
    return output


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--keepalive",
        action="store_true",
        help="send one silent device-status query without changing configuration",
    )
    args = parser.parse_args()
    commands = [status_query()] if args.keepalive else pocket_earth_commands()
    if args.dry_run:
        for command in commands:
            print(command.hex(" "))
        return 0
    write_commands(commands)
    if not args.keepalive:
        print("AhaKey Mode 4 configured: F13/F14/F15/F16; LED effects off", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Keep a previously paired AhaKey connected to the Raspberry Pi."""

from __future__ import annotations

import os
import subprocess
import time


AHAKEY_MAC = os.environ.get("AHAKEY_MAC", "D4:6C:50:5C:F6:93")
RETRY_SECONDS = float(os.environ.get("AHAKEY_RETRY_SECONDS", "5"))


def bluetoothctl(*arguments: str, timeout: float = 12.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["bluetoothctl", *arguments],
        check=False,
        capture_output=True,
        text=True,
        timeout=timeout,
    )


def device_state() -> dict[str, bool]:
    result = bluetoothctl("info", AHAKEY_MAC)
    output = result.stdout
    return {
        "known": result.returncode == 0 and "Device " in output,
        "paired": "Paired: yes" in output,
        "trusted": "Trusted: yes" in output,
        "connected": "Connected: yes" in output,
    }


def reconnect_once() -> str:
    state = device_state()
    if not state["known"] or not state["paired"]:
        return "waiting-for-pairing"
    if not state["trusted"]:
        bluetoothctl("trust", AHAKEY_MAC)
    if state["connected"]:
        return "connected"
    result = bluetoothctl("connect", AHAKEY_MAC)
    return "connected" if result.returncode == 0 and "Connection successful" in result.stdout else "retrying"


def main() -> int:
    previous = ""
    while True:
        try:
            status = reconnect_once()
        except (OSError, subprocess.TimeoutExpired) as exc:
            status = f"error:{exc}"
        if status != previous:
            print(f"ahakey-reconnect: {status}", flush=True)
            previous = status
        time.sleep(RETRY_SECONDS)


if __name__ == "__main__":
    raise SystemExit(main())

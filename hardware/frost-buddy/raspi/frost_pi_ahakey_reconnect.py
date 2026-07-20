#!/usr/bin/env python3
"""Keep a previously paired AhaKey connected to the Raspberry Pi."""

from __future__ import annotations

import os
import subprocess
import time
from collections.abc import Callable


AHAKEY_MAC = os.environ.get("AHAKEY_MAC", "D4:6C:50:5C:F6:93")
RETRY_SECONDS = float(os.environ.get("AHAKEY_RETRY_SECONDS", "5"))
PAIR_RETRY_SECONDS = float(os.environ.get("AHAKEY_PAIR_RETRY_SECONDS", "15"))
AUTO_PAIR = os.environ.get("AHAKEY_AUTO_PAIR", "1").strip().lower() not in {"0", "false", "no"}


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


def pair_once() -> bool:
    # AhaKey only accepts a new bond while its white pairing button is flashing.
    # This attempt is intentionally restricted to the configured MAC address.
    bluetoothctl("--timeout", "5", "scan", "on", timeout=8.0)
    result = bluetoothctl("--agent", "NoInputNoOutput", "pair", AHAKEY_MAC, timeout=20.0)
    bluetoothctl("scan", "off")
    if result.returncode != 0 or "Pairing successful" not in result.stdout:
        return False
    trusted = bluetoothctl("trust", AHAKEY_MAC)
    return trusted.returncode == 0


def reconnect_once(pair_device: Callable[[], bool] = pair_once) -> str:
    state = device_state()
    if not state["paired"]:
        if not AUTO_PAIR:
            return "waiting-for-pairing"
        return "paired" if pair_device() else "press-white-pairing-button"
    if not state["trusted"]:
        bluetoothctl("trust", AHAKEY_MAC)
    if state["connected"]:
        return "connected"
    result = bluetoothctl("connect", AHAKEY_MAC)
    return "connected" if result.returncode == 0 and "Connection successful" in result.stdout else "retrying"


def main() -> int:
    previous = ""
    next_pair_attempt = 0.0
    while True:
        try:
            state = device_state()
            now = time.monotonic()
            if not state["paired"] and now < next_pair_attempt:
                status = "press-white-pairing-button"
            else:
                status = reconnect_once()
                if status == "press-white-pairing-button":
                    next_pair_attempt = now + PAIR_RETRY_SECONDS
        except (OSError, subprocess.TimeoutExpired) as exc:
            status = f"error:{exc}"
        if status != previous:
            print(f"ahakey-reconnect: {status}", flush=True)
            previous = status
        time.sleep(RETRY_SECONDS)


if __name__ == "__main__":
    raise SystemExit(main())

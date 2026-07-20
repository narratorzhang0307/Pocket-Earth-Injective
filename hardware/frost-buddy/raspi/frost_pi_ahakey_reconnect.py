#!/usr/bin/env python3
"""Keep a previously paired AhaKey connected to the Raspberry Pi."""

from __future__ import annotations

import os
import subprocess
import sys
import time
from collections.abc import Callable
from pathlib import Path


AHAKEY_MAC = os.environ.get("AHAKEY_MAC", "D4:6C:50:5C:F6:93")
RETRY_SECONDS = float(os.environ.get("AHAKEY_RETRY_SECONDS", "5"))
PAIR_RETRY_SECONDS = float(os.environ.get("AHAKEY_PAIR_RETRY_SECONDS", "15"))
AUTO_PAIR = os.environ.get("AHAKEY_AUTO_PAIR", "1").strip().lower() not in {"0", "false", "no"}
CONFIGURATION_VERSION = "mode4-f13-f16-led-off-v1"
CONFIGURATION_STAMP = Path(
    os.environ.get(
        "AHAKEY_CONFIGURATION_STAMP",
        "/home/pi/.local/state/pocket-earth/ahakey-mode4.configured",
    )
)
INPUT_ROOT = Path(os.environ.get("AHAKEY_INPUT_ROOT", "/sys/class/input"))


def bluetoothctl(*arguments: str, timeout: float = 12.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["bluetoothctl", *arguments],
        check=False,
        capture_output=True,
        text=True,
        timeout=timeout,
    )


def input_ready(input_root: Path = INPUT_ROOT) -> bool:
    for name_file in input_root.glob("event*/device/name"):
        try:
            if "ahakey" in name_file.read_text(
                encoding="utf-8", errors="ignore"
            ).casefold():
                return True
        except OSError:
            continue
    return False


def device_state() -> dict[str, bool]:
    result = bluetoothctl("info", AHAKEY_MAC)
    output = result.stdout
    return {
        "known": result.returncode == 0 and "Device " in output,
        "paired": "Paired: yes" in output,
        "trusted": "Trusted: yes" in output,
        "connected": "Connected: yes" in output,
        "inputReady": input_ready(),
    }


def ensure_adapter_powered() -> None:
    state = bluetoothctl("show")
    if "Powered: yes" not in state.stdout:
        bluetoothctl("power", "on")


def pair_once() -> bool:
    # AhaKey only accepts a new bond while its white pairing button is flashing.
    # This attempt is intentionally restricted to the configured MAC address.
    bluetoothctl("--timeout", "5", "scan", "on", timeout=8.0)
    try:
        result = bluetoothctl("--agent", "NoInputNoOutput", "pair", AHAKEY_MAC, timeout=20.0)
    finally:
        bluetoothctl("scan", "off")
    if result.returncode != 0 or "Pairing successful" not in result.stdout:
        return False
    trusted = bluetoothctl("trust", AHAKEY_MAC)
    return trusted.returncode == 0


def write_pocket_earth_configuration() -> bool:
    script = Path(__file__).with_name("frost_pi_ahakey_configure.py")
    result = subprocess.run(
        [sys.executable, str(script)],
        check=False,
        capture_output=True,
        text=True,
        timeout=90,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip().replace("\n", " ")
        print(f"ahakey-reconnect: configuration failed: {detail[:300]}", flush=True)
        return False
    return True


def ensure_configuration(
    configure_device: Callable[[], bool] = write_pocket_earth_configuration,
    stamp: Path = CONFIGURATION_STAMP,
    *,
    force: bool = False,
) -> str:
    if not force:
        try:
            if stamp.read_text(encoding="utf-8").strip() == CONFIGURATION_VERSION:
                return "configured"
        except OSError:
            pass
    if not configure_device():
        return "configuration-retry"
    stamp.parent.mkdir(parents=True, exist_ok=True)
    temporary = stamp.with_suffix(stamp.suffix + ".tmp")
    temporary.write_text(CONFIGURATION_VERSION + "\n", encoding="utf-8")
    temporary.replace(stamp)
    return "configured-now"


def reconnect_once(
    pair_device: Callable[[], bool] = pair_once,
    input_device_ready: Callable[[], bool] = input_ready,
) -> str:
    state = device_state()
    if not state["paired"]:
        if not AUTO_PAIR:
            return "waiting-for-pairing"
        return "paired" if pair_device() else "press-white-pairing-button"
    if not state["trusted"]:
        bluetoothctl("trust", AHAKEY_MAC)
    if state["connected"] and state.get("inputReady", True):
        return "connected"
    if state["connected"]:
        # BlueZ may retain Connected=yes while the HID node is gone. Force a
        # clean reconnect so the kernel recreates /dev/input/event*.
        bluetoothctl("disconnect", AHAKEY_MAC)
        time.sleep(0.4)
    result = bluetoothctl("connect", AHAKEY_MAC)
    if result.returncode != 0 or "Connection successful" not in result.stdout:
        return "retrying"
    for _ in range(12):
        if input_device_ready():
            return "connected"
        time.sleep(0.25)
    return "recovering-hid"


def main() -> int:
    previous = ""
    next_pair_attempt = 0.0
    while True:
        try:
            ensure_adapter_powered()
            state = device_state()
            now = time.monotonic()
            if not state["paired"] and now < next_pair_attempt:
                status = "press-white-pairing-button"
            else:
                status = reconnect_once()
                if status == "press-white-pairing-button":
                    next_pair_attempt = now + PAIR_RETRY_SECONDS
                elif status in {"paired", "connected"}:
                    # A fresh bond can follow a device reset. Re-apply Mode 4 even
                    # when an older host-side stamp happens to survive that reset.
                    configuration = ensure_configuration(force=status == "paired")
                    if configuration == "configuration-retry":
                        status = configuration
                    elif configuration == "configured-now":
                        status = "connected-configured"
        except (OSError, subprocess.TimeoutExpired) as exc:
            status = f"error:{exc}"
        if status != previous:
            print(f"ahakey-reconnect: {status}", flush=True)
            previous = status
        time.sleep(RETRY_SECONDS)


if __name__ == "__main__":
    raise SystemExit(main())

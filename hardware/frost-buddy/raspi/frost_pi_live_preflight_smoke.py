#!/usr/bin/env python3
"""Offline parsing checks for the live power preflight."""

import os
from pathlib import Path
from tempfile import TemporaryDirectory

import frost_pi_live_preflight as preflight


assert preflight._metric("battery: 73.4", "battery") == 73.4
assert preflight._metric("battery: I2C not connected", "battery") is None
assert preflight._boolean_metric("battery_power_plugged: true", "battery_power_plugged") is True
assert preflight._boolean_metric("battery_power_plugged: unknown", "battery_power_plugged") is None
assert preflight._text_metric("model: PiSugar 3", "model") == "PiSugar 3"

original_command = preflight._command
original_active = preflight._active
try:
    with TemporaryDirectory() as directory:
        root = Path(directory) / "input"
        device = root / "event5" / "device"
        (device / "capabilities").mkdir(parents=True)
        (device / "name").write_text("AhaKey 505C\n", encoding="utf-8")
        # Codes 183-186 occupy bits 55-58 in the third 64-bit word.
        (device / "capabilities" / "key").write_text(
            "0780000000000000 0 0\n", encoding="ascii"
        )
        stamp = Path(directory) / "ahakey.configured"
        stamp.write_text(preflight.AHAKEY_CONFIGURATION_VERSION + "\n", encoding="utf-8")
        os.environ["AHAKEY_INPUT_ROOT"] = str(root)
        os.environ["AHAKEY_CONFIGURATION_STAMP"] = str(stamp)
        preflight._command = lambda *args: type(
            "Result", (), {
                "stdout": (
                    "Paired: yes\nTrusted: yes\nConnected: yes\n"
                    "Battery Percentage: 0x5e (94)\n"
                ),
                "returncode": 0,
            }
        )()
        preflight._active = lambda unit: unit.startswith("pocket-earth-ahakey")
        ahakey = preflight._ahakey()
        assert ahakey["paired"] is True
        assert ahakey["trusted"] is True
        assert ahakey["connected"] is True
        assert ahakey["batteryPercent"] == 94
        assert ahakey["configurationWritten"] is True
        assert ahakey["mappingReady"] is True
        assert ahakey["keyMap"] == {
            "podcast": True,
            "answers": True,
            "sunset": True,
            "home": True,
        }
        assert ahakey["routerActive"] is True
        assert ahakey["reconnectActive"] is True
        assert ahakey["ready"] is True
        assert ahakey["pairingRequired"] is False
finally:
    os.environ.pop("AHAKEY_INPUT_ROOT", None)
    os.environ.pop("AHAKEY_CONFIGURATION_STAMP", None)
    preflight._command = original_command
    preflight._active = original_active

safe = preflight._safe_shutdown({
    "auto_shutdown_level": 10,
    "auto_shutdown_delay": 30,
    "soft_poweroff": True,
    "soft_poweroff_shell": "shutdown --poweroff 0",
}, hook_enabled=True)
assert safe["configured"] is True
assert preflight._safe_shutdown({}, hook_enabled=False)["configured"] is False

print("frost_pi_live_preflight_smoke: ok")

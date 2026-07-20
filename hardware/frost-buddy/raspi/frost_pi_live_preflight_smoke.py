#!/usr/bin/env python3
"""Offline parsing checks for the live power preflight."""

import frost_pi_live_preflight as preflight


assert preflight._metric("battery: 73.4", "battery") == 73.4
assert preflight._metric("battery: I2C not connected", "battery") is None
assert preflight._boolean_metric("battery_power_plugged: true", "battery_power_plugged") is True
assert preflight._boolean_metric("battery_power_plugged: unknown", "battery_power_plugged") is None
assert preflight._text_metric("model: PiSugar 3", "model") == "PiSugar 3"

original_command = preflight._command
original_active = preflight._active
try:
    preflight._command = lambda *args: type(
        "Result", (), {"stdout": "Paired: yes\nTrusted: yes\nConnected: yes\n", "returncode": 0}
    )()
    preflight._active = lambda unit: unit.startswith("pocket-earth-ahakey")
    ahakey = preflight._ahakey()
    assert ahakey["paired"] is True
    assert ahakey["trusted"] is True
    assert ahakey["connected"] is True
    assert ahakey["routerActive"] is True
    assert ahakey["reconnectActive"] is True
    assert ahakey["ready"] is False  # no synthetic /sys input device in this offline check
    assert ahakey["pairingRequired"] is False
finally:
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
